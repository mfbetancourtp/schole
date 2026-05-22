<template>
  <div class="container mt-4">
    <AppLoading v-if="loading"></AppLoading>
    <template v-else>
      <div class="row">
        <div class="col-12">
          <AppBreadCrumbs :routes="routes"></AppBreadCrumbs>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <h1 class="h3">Carrito de compras</h1>
        </div>
      </div>

      <div class="row" v-if="!shoppingCart.value.length">
        <div class="col-12">
          <div  >
            <div class="card-body">
              <AppEmptyResponse
                  size="sm"
                  title="No tienes productos agregados en el carrito"
                  :subtitle="false"
                  :show-image="true"
                  to="/"
                  to-text="Comprar"
              ></AppEmptyResponse>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4" v-else>
        <div class="col-12 col-lg-8">
          <div  >
            <div class="card-body d-flex flex-column gap-4">
              <div v-for="cart in shoppingCart.value">
                <h2 class="lead">{{ cart.name }}</h2>

                <table class="table">
                  <thead>
                  <tr class="text-center">
                    <th style="width: 55%">Plan</th>
                    <th style="width: 15%">Cantidad</th>
                    <th style="width: 30%;">Total</th>
                    <th></th>
                  </tr>
                  </thead>

                  <tbody>
                  <tr v-for="product in cart.products" :key="product.id">
                    <td>
                      <div class="d-flex flex-column">
                      <span>
                      {{ product.productTitle }}
                    </span>
                        <span>
                      {{ n(product.defaultUnitValue, 'currency') }}
                    </span>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex align-items-center gap-2 justify-content-center">
                        <button class="btn btn-outline-primary btn-sm btn-increase-decrease"
                                :disabled="product.quantity <= 1"
                                @click="increaseOrDecreaseAmounts(product, 'decrease')">
                          -
                        </button>
                        <input type="number" class="form-control input-amount" v-model="product.quantity"
                               @change="updateShoppingCart(product)">
                        <button class="btn btn-outline-primary btn-sm btn-increase-decrease"
                                @click="increaseOrDecreaseAmounts(product, 'increase')">
                          +
                        </button>
                      </div>
                    </td>
                    <td class="tw-text-right">
                      {{ n(product.defaultUnitValue * product.quantity, 'currency') }}
                    </td>
                    <td>
                      <button class="btn btn-outline-primary btn-sm" @click="deleteShoppingCart(product.id)">
                        <AppIcon icon="trash"></AppIcon>
                      </button>
                    </td>
                  </tr>
                  </tbody>

                </table>

              </div>

            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div  >
            <div class="card-body">
              <h3 class="h6">Resumen de la compra</h3>
              <div class="d-flex justify-content-between lead">
              <span>
                Total
              </span>
                <span>
                {{ n(total, 'currency') }}
              </span>
              </div>

              <div class="d-grid gap-2">
                <button class="btn btn-primary text-white" @click="showModalPayment = !showModalPayment">
                  PAGAR
                </button>
                <button class="btn btn-outline-primary" @click="saveQuote">
                  COTIZAR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppModal v-model="showModalPayment" :size="'lg'">
        <AppRegisterPaymentInvoice v-if="showModalPayment"
                                   :total="total"
                                   :service="paymentRegisterService"
                                   :return-url="returnUrl"
                                   :min-initial-fee="0"
                                   @paymentCompleted="paymentCompleted"></AppRegisterPaymentInvoice>
      </AppModal>
    </template>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, reactive, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {useRoute, useRouter} from 'vue-router';

import AppIcon from '../../../shared/components/AppIcon.vue';
import AppBreadCrumbs from '../../../shared/components/AppBreadCrumbs.vue';
import AppEmptyResponse from '../../../shared/components/AppEmptyResponse.vue';
import AppLoading from '../../../shared/components/AppLoading.vue';
import AppModal from '../../../shared/components/Modal/AppModal.vue';
import AppRegisterPaymentInvoice from '../../../shared/components/PaymentGateway/AppRegisterPaymentInvoice.vue';

import {PaymentRegisterService} from '../services/paymentRegister.service';
import {AddProductCatalogueToCartService} from '../services/addProductCatalogueToCart.service';
import {
  CartProductDto,
  GetShoppingCartService,
  LevelsProduct,
} from '../services/getShoppingCart.service';
import {UpdateProductCatalogueToCartService} from '../services/updateProductCatalogueToCart.service';
import {DeleteProductCatalogueToCartService} from '../services/deleteProductCatalogueToCart.service';
import {BreadCrumbsType} from '../../../shared/types/breadCrumbs.type';

const getShoppingCartService = new GetShoppingCartService();
const updateProductCatalogueToCartService = new UpdateProductCatalogueToCartService();
const deleteProductCatalogueToCartService = new DeleteProductCatalogueToCartService();
const addProductCatalogueToCartService = new AddProductCatalogueToCartService();

export default defineComponent({
  name: 'ShoppingCart',
  components: {
    AppRegisterPaymentInvoice,
    AppModal, AppLoading, AppEmptyResponse, AppBreadCrumbs, AppIcon,
  },
  setup() {
    const paymentRegisterService = new PaymentRegisterService();
    const shoppingCart: { value: LevelsProduct[] } = reactive({
      value: [],
    });

    const {n} = useI18n();

    const loading = ref(true);

    const routes: BreadCrumbsType[] = [
      {
        name: 'Inicio',
        url: '/',
      },
      {
        name: 'Carrito de compras',
      },
    ];

    const route = useRoute();
    const router = useRouter();

    const returnUrl = '/shopping';

    onMounted(async () => {
      const {query} = route;

      if (query.productId) {
        let {productId, quantity} = query as any;

        if (!quantity) {
          quantity = 1;
        } else {
          quantity = parseInt(quantity);
        }

        await addProductCatalogueToCartService.run({
          productId,
          quantity,
        });

        await router.push(route.path);
      }

      await getShoppingCart();
      loading.value = false;
    });

    const total = computed(() => {
      let total = 0;

      shoppingCart.value.forEach((cart: any) => {
        cart.products.forEach((product: any) => {
          total += product.defaultUnitValue * product.quantity;
        });
      });

      return total;
    });

    const getShoppingCart = async () => {
      shoppingCart.value = (await getShoppingCartService.run()).levelsProducts;
    };

    const increaseOrDecreaseAmounts = async (cart: CartProductDto, action = 'increase') => {
      if (action === 'increase') {
        cart.quantity++;
      } else {
        cart.quantity--;
      }

      await updateShoppingCart(cart);
    };

    const updateShoppingCart = async (cart: CartProductDto) => {
      try {
        await updateProductCatalogueToCartService.run(cart.id, {
          productId: cart.productId,
          quantity: cart.quantity,
        });
      } catch (e) {

      }
    };

    const deleteShoppingCart = async (shoppingCartId: number) => {
      try {
        await deleteProductCatalogueToCartService.run(shoppingCartId);
        await getShoppingCart();
      } catch (e) {

      }
    };

    const showModalPayment = ref(false);

    const saveQuote = async () => {
      await paymentRegisterService.run({
        invoice: {
          isQuote: true,
        },
      });
      await router.push('/shopping');
    };

    const paymentCompleted = async () => {
      await router.push('/shopping');
    };

    return {
      shoppingCart,
      total,
      routes,
      loading,
      showModalPayment,
      n,
      paymentRegisterService,
      returnUrl,
      updateShoppingCart,
      increaseOrDecreaseAmounts,
      deleteShoppingCart,
      saveQuote,
      paymentCompleted,
    };
  },
});
</script>

<style scoped>
.input-amount {
  width: 50px;
  height: 30px;
  -moz-appearance: textfield;
}

.input-amount::-webkit-outer-spin-button,
.input-amount::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.btn-increase-decrease {
  width: 40px;
}
</style>
