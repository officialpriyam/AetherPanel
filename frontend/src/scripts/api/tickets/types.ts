export interface TicketStatus {
    name: string;
    color: string;
}

export interface TicketPriority {
    name: string;
    color: string;
}

export interface TicketCategory {
    id: number;
    name: string;
}

export interface TicketServerOption {
    id: number;
    name: string;
}

export interface TicketListItem {
    id: number;
    user_id: number;
    subject: string;
    status_id: number;
    priority_id: number;
    category_id: number;
    category: string;
    related_server_id: number | null;
    serverName: string | null;
    created_at: string;
    updated_at: string;
}

export interface TicketMessage {
    id: number;
    ticket_id: number;
    user_id: number;
    message: string;
    sent_at: string;
    firstname: string;
    lastname: string;
}

export interface TicketViewItem extends TicketListItem {
    uuidShort: string | null;
}

export interface TicketsResponseData {
    tickets: TicketListItem[];
    categories: TicketCategory[];
    statuses: TicketStatus[];
    priorities: TicketPriority[];
    servers: TicketServerOption[];
}

export interface TicketResponseData {
    ticket: TicketViewItem;
    messages: TicketMessage[];
    statuses: TicketStatus[];
    priorities: TicketPriority[];
}
