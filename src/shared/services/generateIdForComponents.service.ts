export class GenerateIdForComponentsService {
    run(name: string) {
        return name + '_' + Date.now().toString() + Math.round(Math.random() * 10000);
    }
}