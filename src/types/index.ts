export type QuoteFormPayload = {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  locale?: string;
};

export type ServiceKey = "pdr" | "hail" | "parking" | "vandalism" | "mobile";
