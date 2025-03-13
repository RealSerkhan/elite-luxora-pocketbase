class PaginatedResponse {
    constructor(total_items, total_pages, current_page, per_page, data) {
        this.total_items = total_items;
        this.total_pages = total_pages;
        this.current_page = current_page;
        this.per_page = per_page;
        this.data = data;
    }

    // ✅ Convert class instance to JSON format
    toJSON() {
        return {
            total_items: this.total_items,
            total_pages: this.total_pages,
            current_page: this.current_page,
            per_page: this.per_page,
            data: this.data
        };
    }
}

export default PaginatedResponse;