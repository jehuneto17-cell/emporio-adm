// Lucide-style stroke icons. All take {size, color} props.
const Icon = ({ d, size = 20, color = 'currentColor', stroke = 1.7, fill, children, viewBox = '0 0 24 24' }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill || 'none'}
    stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className="ico">
    {d ? <path d={d} /> : children}
  </svg>
);

const IconHome = (p) => <Icon {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></Icon>;
const IconOrders = (p) => <Icon {...p}><path d="M5 7h14l-1.2 11.2A2 2 0 0 1 15.8 20H8.2a2 2 0 0 1-2-1.8L5 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></Icon>;
const IconProduct = (p) => <Icon {...p}><path d="M21 7.5 12 3 3 7.5"/><path d="M3 7.5v9L12 21l9-4.5v-9"/><path d="M3 7.5 12 12l9-4.5"/><path d="M12 12v9"/></Icon>;
const IconFolder = (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></Icon>;
const IconStock = (p) => <Icon {...p}><path d="M3 20V10"/><path d="M9 20V4"/><path d="M15 20v-8"/><path d="M21 20V7"/></Icon>;
const IconUsers = (p) => <Icon {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M21 19c0-2.2-1.8-4-4-4"/></Icon>;
const IconUserCheck = (p) => <Icon {...p}><circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.3 2.7-6 6-6 1.4 0 2.7.5 3.7 1.2"/><path d="m16 13 2 2 4-4"/></Icon>;
const IconCart = (p) => <Icon {...p}><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.4a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L22 7H6"/></Icon>;
const IconStore = (p) => <Icon {...p}><path d="M3 9 4.5 4h15L21 9"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z"/><path d="M5 13v7h14v-7"/><path d="M10 20v-4h4v4"/></Icon>;
const IconCard = (p) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/><path d="M6 15h4"/></Icon>;
const IconLock = (p) => <Icon {...p}><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/></Icon>;
const IconPlug = (p) => <Icon {...p}><path d="M9 2v6"/><path d="M15 2v6"/><path d="M7 8h10v3a5 5 0 0 1-10 0Z"/><path d="M12 16v6"/></Icon>;
const IconGlobe = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></Icon>;
const IconInstagram = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill={p.color||'currentColor'} stroke="none"/></Icon>;
const IconFacebook = (p) => <Icon {...p}><path d="M15 3h-2.5a4 4 0 0 0-4 4v3H6v4h2.5v7H12v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2Z"/></Icon>;
const IconWhatsapp = (p) => <Icon {...p}><path d="M3 21l1.7-5A8 8 0 1 1 8 19.3L3 21Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/></Icon>;
const IconUserPlus = (p) => <Icon {...p}><circle cx="9" cy="8" r="3.4"/><path d="M3 20c0-3.3 2.7-6 6-6 1 0 2 .3 2.8.7"/><path d="M17 13v6"/><path d="M14 16h6"/></Icon>;
const IconMail = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>;
const IconTicket = (p) => <Icon {...p}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9Z"/><path d="M10 7v10" strokeDasharray="2 2"/></Icon>;
const IconChart = (p) => <Icon {...p}><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-4"/><path d="M12 16V8"/><path d="M16 16v-6"/></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></Icon>;
const IconLogout = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></Icon>;
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>;
const IconBell = (p) => <Icon {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>;
const IconChevronDown = (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>;
const IconChevronLeft = (p) => <Icon {...p}><path d="m15 18-6-6 6-6"/></Icon>;
const IconChevronRight = (p) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Icon>;
const IconDownload = (p) => <Icon {...p}><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></Icon>;
const IconEdit = (p) => <Icon {...p}><path d="M16 3.5a2.1 2.1 0 1 1 3 3L8 17.5l-4 1 1-4 11-11Z"/></Icon>;
const IconEye = (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></Icon>;
const IconEyeOff = (p) => <Icon {...p}><path d="M3 3l18 18"/><path d="M10.6 10.7a3 3 0 0 0 4 4"/><path d="M9.9 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.3 4.1"/><path d="M6.1 6.2A16 16 0 0 0 2 12s3.5 7 10 7a9.3 9.3 0 0 0 4-.9"/></Icon>;
const IconTrash = (p) => <Icon {...p}><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></Icon>;
const IconBox = (p) => <Icon {...p}><path d="m3 8 9-5 9 5"/><path d="M3 8v8l9 5 9-5V8"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/></Icon>;
const IconAlertTri = (p) => <Icon {...p}><path d="M10.3 3.7 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></Icon>;
const IconXCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/></Icon>;
const IconMoney = (p) => <Icon {...p}><path d="M12 2v20"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Icon>;
const IconArrowUp = (p) => <Icon {...p}><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></Icon>;
const IconArrowDown = (p) => <Icon {...p}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="m5 13 4 4L19 7"/></Icon>;
const IconDash = (p) => <Icon {...p}><path d="M5 12h14"/></Icon>;
const IconFilter = (p) => <Icon {...p}><path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/></Icon>;
const IconSort = (p) => <Icon {...p}><path d="M7 4v16"/><path d="m3 8 4-4 4 4"/><path d="M17 20V4"/><path d="m13 16 4 4 4-4"/></Icon>;

const IconX = (p) => <Icon {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Icon>;
const IconBold = (p) => <Icon {...p}><path d="M6 4h6.5a3.5 3.5 0 0 1 0 7H6Z"/><path d="M6 11h7.5a3.5 3.5 0 0 1 0 7H6Z"/></Icon>;
const IconItalic = (p) => <Icon {...p}><path d="M10 4h8"/><path d="M6 20h8"/><path d="M14 4 9 20"/></Icon>;
const IconUnderline = (p) => <Icon {...p}><path d="M7 4v7a5 5 0 0 0 10 0V4"/><path d="M5 20h14"/></Icon>;
const IconList = (p) => <Icon {...p}><path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></Icon>;
const IconLink = (p) => <Icon {...p}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></Icon>;
const IconCamera = (p) => <Icon {...p}><path d="M3 9a2 2 0 0 1 2-2h2l1.5-2h7L17 7h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><circle cx="12" cy="13" r="3.5"/></Icon>;
const IconUpload = (p) => <Icon {...p}><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></Icon>;
const IconSave = (p) => <Icon {...p}><path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M7 3v6h9V3"/><path d="M7 13h10v8H7Z"/></Icon>;
const IconShield = (p) => <Icon {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/></Icon>;
const IconDrag = (p) => <Icon {...p}><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></Icon>;
const IconArrowLeft = (p) => <Icon {...p}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></Icon>;
const IconStar = (p) => <Icon {...p}><path d="m12 3 2.7 5.7 6.3.9-4.5 4.4 1 6.3L12 17.4 6.5 20.3l1-6.3L3 9.6l6.3-.9Z"/></Icon>;
const IconCalendar = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3 10h18"/></Icon>;
const IconHistory = (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/></Icon>;
const IconPrinter = (p) => <Icon {...p}><path d="M6 9V3h12v6"/><path d="M6 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><path d="M6 14h12v7H6z"/></Icon>;
const IconCopy = (p) => <Icon {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></Icon>;
const IconMapPin = (p) => <Icon {...p}><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Z"/><circle cx="12" cy="10" r="2.6"/></Icon>;
const IconTruck = (p) => <Icon {...p}><path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></Icon>;
const IconExternal = (p) => <Icon {...p}><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></Icon>;
const IconPercent = (p) => <Icon {...p}><path d="m19 5-14 14"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></Icon>;
const IconRefresh = (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></Icon>;
const IconPhoto = (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></Icon>;
const IconLayers = (p) => <Icon {...p}><path d="m12 2 9 4.5-9 4.5-9-4.5Z"/><path d="m3 11.5 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/></Icon>;
const IconGrip = (p) => <Icon {...p}><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></Icon>;

Object.assign(window, {
  Icon, IconHome, IconOrders, IconProduct, IconFolder, IconStock, IconUsers,
  IconTicket, IconChart, IconSettings, IconLogout, IconSearch, IconBell,
  IconChevronDown, IconChevronLeft, IconChevronRight, IconPlus, IconDownload,
  IconEdit, IconEye, IconEyeOff, IconTrash, IconBox, IconAlertTri, IconXCircle, IconMoney,
  IconArrowUp, IconArrowDown, IconCheck, IconDash, IconFilter, IconSort,
  IconX, IconBold, IconItalic, IconUnderline, IconList, IconLink, IconCamera,
  IconUpload, IconSave, IconShield, IconDrag, IconArrowLeft, IconStar,
  IconCalendar, IconHistory, IconPrinter, IconCopy, IconMapPin, IconTruck, IconExternal,
  IconUserCheck, IconMail, IconPercent, IconRefresh, IconCart, IconUserPlus,
  IconStore, IconCard, IconLock, IconPlug, IconGlobe, IconInstagram, IconFacebook, IconWhatsapp,
  IconPhoto, IconLayers, IconGrip,
});
