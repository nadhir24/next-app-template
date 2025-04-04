export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Rano Cake",
  description: "Make beautiful Cake Everyday.",
  navItems: [
    {
      label: "Beranda",
      href: "/",
    },
    {
      label: "Katalog",
      href: "/katalog",
    },

    {
      label: "Tentang kami",
      href: "/tentangkami",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },

    {
      label: "tentang kami",
      href: "/tentangkami",
    },
    {
      label: "Katalog",
      href: "/Katalog",
    },
  ],
  footerItems: [
    {
      label: "tentang kami",
      href: "/tentangkami",
    },

    {
      label: "Katalog",
      href: "/Katalog",
    },
  ],
  links: {
    google: "https://maps.app.goo.gl/uehWLXqC3s1z1Djw9",
    whatsapp: "https://wa.me/081385642024",
  },
};
