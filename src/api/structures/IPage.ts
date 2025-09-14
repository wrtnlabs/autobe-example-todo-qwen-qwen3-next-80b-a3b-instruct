import { tags } from "typia";

export namespace IPage {
  /** Page information. */
  export type IPagination = {
    /** Current page number. */
    current: number & tags.Type<"int32"> & tags.Minimum<0>;

    /** Limitation of records per a page. */
    limit: number & tags.Type<"int32"> & tags.Minimum<0>;

    /** Total records in the database. */
    records: number & tags.Type<"int32"> & tags.Minimum<0>;

    /**
     * Total pages.
     *
     * Equal to {@link records} / {@link limit} with ceiling.
     */
    pages: number & tags.Type<"int32"> & tags.Minimum<0>;
  };

  /**
   * Page request data for paginated searches.
   *
   * This type represents the pagination parameters submitted in request
   * bodies for list endpoints.
   *
   * It is the subset of ITodoListTodo.IRequest that contains only page and
   * limit parameters.
   *
   * This structure is designed to be used when only pagination control is
   * needed, without other search or filter criteria.
   *
   * It is typically used internally by UI components that implement
   * pagination without additional filtering.
   *
   * Note: Although this type exists, the search endpoint uses the more
   * comprehensive ITodoListTodo.IRequest which includes these two fields plus
   * additional filter options.
   */
  export type IRequest = {
    /**
     * Page number.
     *
     * Specifies which page of results to return.
     *
     * Page numbers start at 1.
     *
     * Maximum is 1000 to prevent server resource overuse.
     *
     * This parameter is optional, defaults to 1 if not provided.
     *
     * Should be used in conjunction with limit for pagination.
     */
    page?:
      | (number & tags.Type<"int32"> & tags.Minimum<1> & tags.Maximum<1000>)
      | undefined;

    /**
     * Limitation of records per a page.
     *
     * Specifies how many results to return per page.
     *
     * Minimum is 1, maximum is 200 to prevent excessively large responses.
     *
     * Default value is 20 if omitted.
     *
     * This parameter allows clients to control the amount of data
     * transferred in one request.
     */
    limit?:
      | (number & tags.Type<"int32"> & tags.Minimum<1> & tags.Maximum<200>)
      | undefined;
  };
}
