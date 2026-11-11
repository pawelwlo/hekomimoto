export const siteConfig = {
  name: "Hekomimoto",
  phone: "+48 601 416 332",
  phoneHref: "tel:+48601416332",
  whatsapp: "https://wa.me/48601416332",
  email: "kontakt@hekomimoto.com",
  emailHref: "mailto:kontakt@hekomimoto.com",
  address: {
    line1: "Ul. Obornicka 344",
    line2: "60-689 Poznań",
    country: "Polska",
    full: "Ul. Obornicka 344, 60-689 Poznań",
  },
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Ul.+Obornicka+344,+60-689+Pozna%C5%84&t=&z=15&ie=UTF8&iwloc=&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Ul.+Obornicka+344,+60-689+Pozna%C5%84",
  hours: {
    weekdays: "08:00 – 18:00",
    saturday: "09:00 – 14:00",
    sunday: "closed",
  },
  social: {
    facebook: "#",
    instagram: "https://www.instagram.com/hekomimoto9/",
    google: "#",
  },
  url: "https://hekomimoto.com",
} as const;

export const navItems = [
  { href: "/", key: "home" },
  { href: "/services/pdr", key: "services" },
  { href: "/gallery", key: "gallery" },
  { href: "/about", key: "about" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

export const serviceRoutes = [
  { href: "/services/pdr", key: "pdr" },
  { href: "/services/hail", key: "hail" },
  { href: "/services/parking-dents", key: "parking" },
  { href: "/services/vandalism", key: "vandalism" },
  { href: "/services/mobile", key: "mobile" },
] as const;
