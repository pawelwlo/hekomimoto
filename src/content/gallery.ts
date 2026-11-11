export type GalleryCategory = "hail" | "parking" | "vandalism" | "classic";

export type GalleryItem = {
  id: string;
  category: GalleryCategory;
  /** Local path under /public — Instagram @hekomimoto9 */
  src: string;
  /** Optional paired before image; when omitted, lightbox shows a single photo */
  beforeSrc?: string;
  afterSrc?: string;
  altKey: string;
};

/**
 * Photos downloaded from Instagram @hekomimoto9
 * (public/images/gallery/ig-*.jpg)
 */
export const galleryItems: GalleryItem[] = [
  {
    id: "1",
    category: "classic",
    src: "/images/gallery/ig-01.jpg",
    altKey: "ig-01",
  },
  {
    id: "2",
    category: "parking",
    src: "/images/gallery/ig-02.jpg",
    altKey: "ig-02",
  },
  {
    id: "3",
    category: "hail",
    src: "/images/gallery/ig-03.jpg",
    altKey: "ig-03",
  },
  {
    id: "4",
    category: "parking",
    src: "/images/gallery/ig-04.jpg",
    altKey: "ig-04",
  },
  {
    id: "5",
    category: "vandalism",
    src: "/images/gallery/ig-05.jpg",
    altKey: "ig-05",
  },
  {
    id: "6",
    category: "hail",
    src: "/images/gallery/ig-06.jpg",
    altKey: "ig-06",
  },
  {
    id: "7",
    category: "parking",
    src: "/images/gallery/ig-07.jpg",
    altKey: "ig-07",
  },
  {
    id: "8",
    category: "classic",
    src: "/images/gallery/ig-08.jpg",
    altKey: "ig-08",
  },
  {
    id: "9",
    category: "hail",
    src: "/images/gallery/ig-09.jpg",
    altKey: "ig-09",
  },
  {
    id: "10",
    category: "parking",
    src: "/images/gallery/ig-10.jpg",
    altKey: "ig-10",
  },
  {
    id: "11",
    category: "vandalism",
    src: "/images/gallery/ig-11.jpg",
    altKey: "ig-11",
  },
  {
    id: "12",
    category: "classic",
    src: "/images/gallery/ig-12.jpg",
    altKey: "ig-12",
  },
];

/** Hero background — Instagram https://www.instagram.com/p/Bzz_7fShY4A/ */
export const heroImage = "/images/hero/home-bg.jpg";

/** Workshop / about visual */
export const workshopImage = "/images/gallery/ig-07.jpg";

export const teamImages: string[] = [];
