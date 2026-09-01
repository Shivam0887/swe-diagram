/**
 * Tabler icon registry. Architecture-flavored icons with 2px stroke,
 * MIT-licensed. ~6,200 icons available at https://tabler.io/icons
 *
 * API matches {@link ./lucide}: getTablerIcon(name) returns a React
 * component, or null if not found.
 *
 * The full set is loaded via the package's `icons` namespace export
 * which is the runtime-merged map of all 6,184 Tabler icons. We just
 * pick a curated subset to surface in the registry.
 */
import * as Tabler from '@tabler/icons-react';
import type { Icon as TablerIconComponent } from '@tabler/icons-react';

/**
 * Curated subset surfaced in this app. To widen the set, add names here.
 * Any name present in the `tabler` package will resolve via
 * {@link getTablerIcon} without additional changes.
 */
export const tablerIconNames = [
  // Compute
  'IconServer', 'IconServer2', 'IconServerCog', 'IconServerOff', 'IconServerBolt',
  'IconCpu', 'IconCpuOff', 'IconMicrochip',
  'IconCircuitDiode', 'IconCircuitGround', 'IconCircuitResistor', 'IconCircuitCapacitor',
  'IconAntenna', 'IconRouter', 'IconRouterOff', 'IconAccessPoint', 'IconAccessPointOff',
  'IconWifi', 'IconWifiOff',
  'IconBluetooth', 'IconBluetoothOff', 'IconBluetoothConnected',
  'IconContainer', 'IconContainerOff', 'IconBox', 'IconBoxMultiple',
  'IconBoxAlignTop', 'IconBoxAlignBottom', 'IconBoxAlignLeft', 'IconBoxAlignRight',
  'IconBoxMargin', 'IconBoxModel', 'IconBoxOff', 'IconBoxSeam',
  'IconPackage', 'IconPackageExport', 'IconPackageImport', 'IconPackageOff', 'IconPackages',

  // Storage
  'IconDatabase', 'IconDatabaseCog', 'IconDatabaseOff', 'IconDatabaseExport', 'IconDatabaseImport',
  'IconArchive', 'IconArchiveOff', 'IconFolders', 'IconFolder', 'IconFolderOpen', 'IconFolderCog',
  'IconFile', 'IconFileText', 'IconFileCode', 'IconFileCog', 'IconFileZip', 'IconFileExport', 'IconFileImport',

  // Cloud
  'IconCloud', 'IconCloudComputing', 'IconCloudCog', 'IconCloudDownload', 'IconCloudUpload', 'IconCloudOff',
  'IconCloudStorm', 'IconCloudRain', 'IconWind',

  // Network & topology
  'IconNetwork', 'IconNetworkOff',
  'IconTopologyBus', 'IconTopologyRing', 'IconTopologyRing2', 'IconTopologyRing3',
  'IconTopologyStar', 'IconTopologyStar2', 'IconTopologyStar3',
  'IconGlobe', 'IconGlobeOff', 'IconWorld', 'IconWorldCog', 'IconWorldDownload', 'IconWorldUpload',
  'IconRoute', 'IconRouteOff', 'IconSitemap', 'IconRoad', 'IconRoadOff',
  'IconMap', 'IconMapSearch', 'IconMapPin', 'IconMapPinOff', 'IconMapPins',
  'IconCompass',

  // Security
  'IconLock', 'IconLockOpen', 'IconShield', 'IconShieldCheck', 'IconShieldCog', 'IconShieldLock',
  'IconKey', 'IconPassword', 'IconFingerprint', 'IconScan',

  // Observability
  'IconActivity', 'IconActivityHeartbeat', 'IconChartBar', 'IconChartLine', 'IconChartPie',
  'IconChartDots', 'IconChartArea',
  'IconBell', 'IconBellRinging', 'IconBellOff',
  'IconAlertTriangle', 'IconAlertCircle', 'IconAlertHexagon',
  'IconEye', 'IconEyeCog', 'IconEyeOff',

  // Code & VCS
  'IconCode', 'IconCodeCircle', 'IconCodeCircle2', 'IconTerminal', 'IconTerminal2',
  'IconBrandGit', 'IconGitBranch', 'IconGitFork', 'IconGitMerge', 'IconGitCommit',
  'IconGitPullRequest', 'IconGitCompare',
  'IconBrandGithub', 'IconBrandGitlab',

  // Brand cloud / framework
  'IconBrandDocker', 'IconBrandKubernetes', 'IconBrandAws', 'IconBrandGoogle', 'IconBrandAzure',
  'IconBrandSlack', 'IconBrandStripe', 'IconBrandVercel',
  'IconBrandReact', 'IconBrandNodejs', 'IconBrandPython', 'IconBrandRust', 'IconBrandGraphql',
  'IconBrandTerraform', 'IconBrandPowershell', 'IconBrandVscode', 'IconBrandVite',
  'IconBrandX', 'IconBrandChrome', 'IconBrandSafari', 'IconBrandFirefox',
  'IconBrandWindows', 'IconBrandApple', 'IconBrandAndroid', 'IconBrandUbuntu', 'IconBrandDebian',
  'IconBrandRedhat',

  // Messaging
  'IconMessage', 'IconMessageCircle', 'IconMessage2', 'IconMessage2Cog', 'IconMessage2Off',
  'IconMessageDots', 'IconMessageReport',
  'IconMail', 'IconMailCog', 'IconMailFast', 'IconMailForward', 'IconMailOpened', 'IconMailbox',
  'IconInbox', 'IconInboxOff', 'IconSend', 'IconSendOff',
  'IconWebhook', 'IconRss', 'IconShare', 'IconShare3', 'IconLink', 'IconLinkOff', 'IconUnlink',

  // Layout & UI primitives
  'IconLayoutDashboard', 'IconLayoutGrid', 'IconLayoutList', 'IconLayoutKanban', 'IconLayoutSidebar', 'IconLayoutCollage',
  'IconAppWindow', 'IconApps',
  'IconStack', 'IconStack2', 'IconStack3', 'IconStackPop', 'IconStackPush',
  'IconHierarchy', 'IconHierarchy2', 'IconHierarchy3',
  'IconBinaryTree', 'IconBinaryTree2',

  // Buildings / clients
  'IconBuildingArch', 'IconBuildingBank', 'IconBuildingBridge', 'IconBuildingCarousel',
  'IconBuildingCastle', 'IconBuildingChurch', 'IconBuildingCommunity', 'IconBuildingCottage',
  'IconBuildingFactory', 'IconBuildingFortress', 'IconBuildingHospital', 'IconBuildingLighthouse',
  'IconBuildingMonument', 'IconBuildingPavilion', 'IconBuildingSkyscraper', 'IconBuildingStore', 'IconBuildingWarehouse',
  'IconHome', 'IconHomeCog', 'IconHomeOff', 'IconSmartHome',

  // AI / agents
  'IconRobot', 'IconRobotFace', 'IconRobotOff',
  'IconBolt', 'IconBoltOff', 'IconRocket', 'IconRocketOff',
  'IconFlame', 'IconFlameOff',

  // Theme / state
  'IconSun', 'IconMoon', 'IconStar',
  'IconHeart', 'IconHeartOff', 'IconHeartFilled',
  'IconBookmark', 'IconBookmarkFilled', 'IconBookmarkOff',
  'IconTag', 'IconTags', 'IconHash', 'IconAt',
  'IconSearch', 'IconSearchOff', 'IconFilter', 'IconFilterOff',
  'IconSortAscending', 'IconSortDescending', 'IconArrowsSort',
  'IconAdjustments', 'IconAdjustmentsAlt',
  'IconPalette', 'IconBrush', 'IconPencil', 'IconPencilOff',

  // Cursors / focus
  'IconAnchor', 'IconAnchorOff', 'IconClick', 'IconPointer', 'IconFocus', 'IconFocus2', 'IconFocusCentered',
  'IconScanEye', 'IconZoomIn', 'IconZoomOut', 'IconZoomReset', 'IconZoomPan',
  'IconMaximize', 'IconMinimize', 'IconExternalLink', 'IconRefresh', 'IconReload',
  'IconRotate', 'IconRotate2', 'IconRotateClockwise', 'IconRotateRectangle',

  // Status circles / squares / shapes
  'IconCircleCheck', 'IconCircleCheckFilled', 'IconCircleX', 'IconCircleXFilled',
  'IconCircleDot', 'IconCircleDotFilled', 'IconCircleDashed',
  'IconCircleArrowDown', 'IconCircleArrowUp', 'IconCircleArrowLeft', 'IconCircleArrowRight',
  'IconCircleCaretDown', 'IconCircleCaretUp', 'IconCircleCaretLeft', 'IconCircleCaretRight',
  'IconCircleChevronDown', 'IconCircleChevronUp', 'IconCircleChevronLeft', 'IconCircleChevronRight',
  'IconCirclePlus', 'IconCircleMinus', 'IconCircle', 'IconCircleFilled', 'IconCircleOff',
  'IconSquare', 'IconSquareDot', 'IconSquareDotFilled',
  'IconSquareRounded', 'IconSquareRoundedX', 'IconSquareRoundedCheck', 'IconSquareRoundedPlus', 'IconSquareRoundedMinus',
  'IconTriangle', 'IconTriangleFilled', 'IconTriangleInverted', 'IconTriangleSquareCircle',
  'IconHexagon', 'IconHexagon3d', 'IconHexagonFilled', 'IconHexagons',
  'IconOctagon', 'IconOctagonFilled', 'IconPentagon', 'IconPentagonFilled',
  'IconDiamond', 'IconDiamondFilled',
  'IconCone', 'IconCone2', 'IconCylinder', 'IconCylinderOff', 'IconSphere',
  'IconCube', 'IconCubeSend', 'IconCubeUnfolded', 'IconConePlus',

  // Chevrons / arrows
  'IconChevronDown', 'IconChevronUp', 'IconChevronLeft', 'IconChevronRight',
  'IconChevronsDown', 'IconChevronsUp', 'IconChevronsLeft', 'IconChevronsRight',
  'IconSelector',
  'IconArrowDown', 'IconArrowLeft', 'IconArrowRight', 'IconArrowUp',
  'IconArrowBigDown', 'IconArrowBigLeft', 'IconArrowBigRight', 'IconArrowBigUp',
  'IconArrowsHorizontal', 'IconArrowsVertical', 'IconArrowsMaximize', 'IconArrowsMinimize',
  'IconArrowsMove', 'IconArrowsSort', 'IconArrowsCross', 'IconArrowsDiagonal',
  'IconArrowsDiagonalMinimize', 'IconArrowsDoubleNeSw', 'IconArrowsDoubleNwSe',
  'IconArrowsDown', 'IconArrowsDownUp', 'IconArrowsLeft', 'IconArrowsLeftRight',
  'IconArrowsRight', 'IconArrowsRightLeft', 'IconArrowsShuffle', 'IconArrowsUp',
  'IconArrowsUpDown', 'IconArrowsUpLeft', 'IconArrowsUpRight',
] as const;

export type TablerIconName = (typeof tablerIconNames)[number];

/**
 * Look up a Tabler icon by name (with or without the "Icon" prefix).
 *
 * Tabler exports every icon as a named export of `@tabler/icons-react`,
 * so we just access it dynamically on the namespace. The runtime cost
 * is one property lookup per call; the type assertion keeps callers
 * strongly-typed at the call site.
 */
export function getTablerIcon(name: string): TablerIconComponent | null {
  if (!name) return null;
  const lib = Tabler as unknown as Record<string, TablerIconComponent | undefined>;
  if (name in lib) return lib[name] ?? null;
  if (!name.startsWith('Icon')) {
    const prefixed = `Icon${name}`;
    if (prefixed in lib) return lib[prefixed] ?? null;
  }
  return null;
}

export type { TablerIconComponent };
