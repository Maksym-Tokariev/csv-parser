export function getContext(instance: any): string {
    if (!instance || !instance.constructor.name) {
        return 'Unknown';
    }
    return instance.constructor.name;
}