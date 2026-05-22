import axios from 'axios';
import {services} from "../../../shared/constant/services";

interface ISendDeepLinkService {
    id:number;
    title: string;
    urlContent: string;
    productId: number;
}

export class SendDeepLinkService {
    async run(data: ISendDeepLinkService): Promise<void> {
        /*
        fetch('http://localhost:3030/deeplink',{
            method:'post',
            body:JSON.stringify(data),
            credentials: 'include',
            headers: { Authorization: `Bearer ${tokenLtiService.get()}` }
        })
            .then(response => response.text())
            .then(auxHtml => {
                console.log(auxHtml);
                const form =  new DOMParser().parseFromString(auxHtml, 'text/html');
                console.log(form);
                document.body.appendChild(form.body);
                document.getElementById('ltijs_submit').submit();
            });
         */
        //await fetch.post(`http://localhost:3030/deeplink`, data, config);
        await axios.post(`${services.ltiProvider}/deeplink`, data).then((response) => {
            const auxHtml = response.data;
            console.log(auxHtml);
            const form =  new DOMParser().parseFromString(auxHtml, 'text/html');
            console.log(form);
            document.body.appendChild(form.body);
            document.getElementById('ltijs_submit').submit();
        });
    }
}