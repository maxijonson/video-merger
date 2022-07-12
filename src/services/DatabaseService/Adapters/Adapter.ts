import Model from "../Models/Model";

abstract class Adapter {
    public abstract init(): Promise<void>;

    /**
     * Create a new collection.
     *
     * @param id The id of the collection
     * @param overwrite If true, the collection will be overwritten if it already exists
     * @returns `true` if the collection was created, `false` if it already existed and `overwrite` was `false`
     */
    public abstract createCollection(
        id: string,
        overwrite: boolean
    ): Promise<boolean>;

    /**
     * Checks if a collection exists.
     *
     * @param id The id of the collection
     * @returns True if the collection exists, false otherwise
     */
    public abstract hasCollection(id: string): Promise<boolean>;

    /**
     * Inserts data into a collection.
     *
     * @param collectionId The id of the collection
     * @param data The data to be stored
     * @param overwrite If true, the item will be overwritten if it already exists
     * @returns The inserted item or null if it already exists and `overwrite` is false
     */
    public abstract insert<T extends Model>(
        collectionId: string,
        data: T,
        overwrite: boolean
    ): Promise<T | null>;

    /**
     * Gets an item from a collection.
     *
     * @param collectionId The id of the collection
     * @param id The id of the item
     * @returns The item if it exists, `null` otherwise
     */
    public abstract get<T extends Model>(
        collectionId: string,
        id: string
    ): Promise<T | null>;

    /**
     * Checks if an item exists in a collection.
     *
     * @param collectionId The id of the collection
     * @param id The id of the item
     * @returns True if the item exists, false otherwise
     */
    public abstract has(collectionId: string, id: string): Promise<boolean>;

    /**
     * Updates an item in a collection.
     *
     * @param collectionId The id of the collection
     * @param data The data to be stored
     * @returns The updated item or null if the item does not exist
     */
    public abstract update<T extends Model>(
        collectionId: string,
        data: T
    ): Promise<T | null>;

    /**
     * Deletes an item from a collection. If the item does not exist, the method will return `false`.
     *
     * @param collectionId The id of the collection
     * @param id The id of the item
     * @returns `true` if the item was deleted, `false` otherwise
     */
    public abstract delete(collectionId: string, id: string): Promise<boolean>;

    /**
     * Gets all items from a collection.
     *
     * @param collectionId The id of the collection
     * @returns An array of all items in the collection
     */
    public abstract getAll<T extends Model>(collectionId: string): Promise<T[]>;

    /**
     * Use to close the adapter.
     */
    public abstract close(): Promise<void>;
}

export default Adapter;
