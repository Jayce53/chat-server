// noinspection JSUnusedGlobalSymbols
interface StorageConfig {
  storageType : "local" | "cloudflare",
}
interface StorageInterface {
  save(fileName : string, buffer : Buffer) : Promise<void>;
  setContainerName(containerName : string) : void;
}
