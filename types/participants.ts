interface Filters {
  search: string;
  category: string;
  paymentStatus: string;
  status: string;
}

interface Props {
  eventId: string;
  filters: Filters;
}

export interface ParticipantFiltersType {
  search: string;
  category: string;
  paymentStatus: string;
  status: string;
}
