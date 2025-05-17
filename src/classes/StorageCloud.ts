
// noinspection JSUnusedGlobalSymbols
export class StorageCloud implements StorageInterface {

  save(_fileName : string, _buffer : Buffer) : Promise<void> {
    console.log("save cloud");
    return Promise.resolve();
  }

  setContainerName(_containerName : string): void {
    console.log("setContainerName cloud");
  }
}
