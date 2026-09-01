import { iconFromPaths, type DiagramIconDefinition } from './types';

// Clients & Devices
export const userIcon: DiagramIconDefinition = iconFromPaths(
  'user',
  'client',
  '0 0 24 24',
  ['M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'],
);
export const usersIcon: DiagramIconDefinition = iconFromPaths(
  'users',
  'client',
  '0 0 24 24',
  [
    'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  ],
);
export const browserIcon: DiagramIconDefinition = iconFromPaths(
  'browser',
  'client',
  '0 0 24 24',
  ['M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm15 11H4V8h16v10z'],
);
export const mobileIcon: DiagramIconDefinition = iconFromPaths(
  'mobile',
  'client',
  '0 0 24 24',
  ['M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14zm-5 1c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z'],
);
export const laptopIcon: DiagramIconDefinition = iconFromPaths(
  'laptop',
  'client',
  '0 0 24 24',
  ['M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z'],
);
export const terminalIcon: DiagramIconDefinition = iconFromPaths(
  'terminal',
  'client',
  '0 0 24 24',
  ['M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-12.5-2L6 14.5 8.5 12 6 9.5 7.5 8l4 4-4 4zm5 0h5v-2h-5v2z'],
);
export const botIcon: DiagramIconDefinition = iconFromPaths(
  'bot',
  'client',
  '0 0 24 24',
  ['M12 2a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zm-3 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-6 5h6v1H9v-1z'],
);

// Compute & Services
export const serviceIcon: DiagramIconDefinition = iconFromPaths(
  'service',
  'compute',
  '0 0 24 24',
  ['M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z'],
);
export const workerIcon: DiagramIconDefinition = iconFromPaths(
  'worker',
  'compute',
  '0 0 24 24',
  ['M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z'],
);
export const serverIcon: DiagramIconDefinition = iconFromPaths(
  'server',
  'compute',
  '0 0 24 24',
  ['M2 4v4h20V4H2zm4 3H4V5h2v2zm16 4H2v4h20v-4zm-16 3H4v-2h2v2zm16 4H2v4h20v-4zm-16 3H4v-2h2v2z'],
);
export const containerIcon: DiagramIconDefinition = iconFromPaths(
  'container',
  'compute',
  '0 0 24 24',
  ['M21 16.5l-9 5.2-9-5.2V7.5l9-5.2 9 5.2v9zM12 4.1L5 8.2l7 4 7-4-7-4.1zm-7 5.8v6.2l6 3.5v-6.2l-6-3.5zm8 9.7l6-3.5V9.9l-6 3.5v6.2z'],
);
export const lambdaIcon: DiagramIconDefinition = iconFromPaths(
  'lambda',
  'compute',
  '0 0 24 24',
  ['M6 2h3l5.5 13.5L18 7h3l-5 11.5V22h-3v-4.5L10 9l-4 13H3L6 2z'],
);
export const codeIcon: DiagramIconDefinition = iconFromPaths(
  'code',
  'compute',
  '0 0 24 24',
  ['M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z'],
);
export const cpuIcon: DiagramIconDefinition = iconFromPaths(
  'cpu',
  'compute',
  '0 0 24 24',
  ['M4 6h2v2H4V6zm0 5h2v2H4v-2zm0 5h2v2H4v-2zm14-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2zM6 4h2v2H6V4zm5 0h2v2h-2V4zm5 0h2v2h-2V4zm-10 14h2v2H6v-2zm5 0h2v2h-2v-2zm5 0h2v2h-2v-2zM8 8h8v8H8V8z'],
);

// Storage & Databases
export const databaseIcon: DiagramIconDefinition = iconFromPaths(
  'database',
  'storage',
  '0 0 24 24',
  ['M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4zm0 2c4.42 0 8 1.34 8 2s-3.58 2-8 2-8-1.34-8-2 3.58-2 8-2zm0 6c4.42 0 8 1.34 8 2s-3.58 2-8 2-8-1.34-8-2 3.58-2 8-2zm0 6c4.42 0 8 1.34 8 2s-3.58 2-8 2-8-1.34-8-2 3.58-2 8-2z'],
);
export const postgresqlIcon: DiagramIconDefinition = iconFromPaths(
  'postgresql',
  'storage',
  '0 0 24 24',
  ['M12 3C7.03 3 3 7.03 3 12c0 3.58 2.11 6.67 5.16 8.08-.04-.55-.07-1.22-.07-1.9 0-1.32.18-2.61.54-3.77-.38-.28-.7-.64-.94-1.06-.6-1.04-.62-2.31-.05-3.37.58-1.07 1.69-1.78 2.94-1.9 1.15-.11 2.31.33 3.09 1.17.78-.84 1.94-1.28 3.09-1.17 1.25.12 2.36.83 2.94 1.9.57 1.06.55 2.33-.05 3.37-.24.42-.56.78-.94 1.06.36 1.16.54 2.45.54 3.77 0 .68-.03 1.35-.07 1.9C18.89 18.67 21 15.58 21 12c0-4.97-4.03-9-9-9z'],
);
export const mysqlIcon: DiagramIconDefinition = iconFromPaths(
  'mysql',
  'storage',
  '0 0 24 24',
  ['M12 3a9 9 0 0 0-9 9c0 3.57 2.08 6.65 5.1 8.12l.62-1.78A7.14 7.14 0 0 1 4.9 12 7.1 7.1 0 0 1 12 4.9c3.92 0 7.1 3.18 7.1 7.1 0 2.44-1.24 4.6-3.12 5.86l1.1 1.55A8.96 8.96 0 0 0 21 12a9 9 0 0 0-9-9zm-1 5h2v6h-2V8zm0 8h2v2h-2v-2z'],
);
export const redisIcon: DiagramIconDefinition = iconFromPaths(
  'redis',
  'storage',
  '0 0 24 24',
  ['M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'],
);
export const cacheIcon: DiagramIconDefinition = iconFromPaths(
  'cache',
  'storage',
  '0 0 24 24',
  ['M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 4H7v2h7V7zm3 4H7v2h10v-2zm-3 4H7v2h7v-2z'],
);
export const mongodbIcon: DiagramIconDefinition = iconFromPaths(
  'mongodb',
  'storage',
  '0 0 24 24',
  ['M12 2C11.5 2 7 8.5 7 13.5 7 17.5 9.5 20.5 12 22c2.5-1.5 5-4.5 5-8.5C17 8.5 12.5 2 12 2zm0 18.5c-1.8-1.2-3.5-3.6-3.5-7 0-3.3 2.7-7.4 3.5-8.8.8 1.4 3.5 5.5 3.5 8.8 0 3.4-1.7 5.8-3.5 7z'],
);
export const elasticsearchIcon: DiagramIconDefinition = iconFromPaths(
  'elasticsearch',
  'storage',
  '0 0 24 24',
  ['M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm-5 6h10v2H7zm0 4h10v2H7z'],
);
export const objectStorageIcon: DiagramIconDefinition = iconFromPaths(
  'object_storage',
  'storage',
  '0 0 24 24',
  ['M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z'],
);
export const s3Icon: DiagramIconDefinition = iconFromPaths(
  's3',
  'storage',
  '0 0 24 24',
  ['M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H5V8h14v10zm-8-9h2v4h3l-4 4-4-4h3V9z'],
);
export const searchIcon: DiagramIconDefinition = iconFromPaths(
  'search',
  'storage',
  '0 0 24 24',
  ['M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'],
);

// Messaging & Streaming
export const queueIcon: DiagramIconDefinition = iconFromPaths(
  'queue',
  'messaging',
  '0 0 24 24',
  ['M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zm-7-2h2v-2h-2v2zm0-4h2V6h-2v4z'],
);
export const kafkaIcon: DiagramIconDefinition = iconFromPaths(
  'kafka',
  'messaging',
  '0 0 24 24',
  ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'],
);
export const rabbitmqIcon: DiagramIconDefinition = iconFromPaths(
  'rabbitmq',
  'messaging',
  '0 0 24 24',
  ['M12 2a5 5 0 0 0-5 5c0 1.4.6 2.7 1.5 3.6L7 16h10l-1.5-5.4c.9-.9 1.5-2.2 1.5-3.6a5 5 0 0 0-5-5zm-2 16v4h4v-4h-4z'],
);
export const sqsIcon: DiagramIconDefinition = iconFromPaths(
  'sqs',
  'messaging',
  '0 0 24 24',
  ['M3 5h18v4H3V5zm0 5h18v4H3v-4zm0 5h18v4H3v-4z'],
);

// Networking & Gateways
export const apiGatewayIcon: DiagramIconDefinition = iconFromPaths(
  'api_gateway',
  'network',
  '0 0 24 24',
  ['M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V8h14v10zm-7-2l4-4-1.41-1.41L13 12.17V9h-2v3.17l-1.59-1.58L8 12l4 4z'],
);
export const loadBalancerIcon: DiagramIconDefinition = iconFromPaths(
  'load_balancer',
  'network',
  '0 0 24 24',
  ['M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z'],
);
export const cdnIcon: DiagramIconDefinition = iconFromPaths(
  'cdn',
  'network',
  '0 0 24 24',
  ['M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-1.41-1.41L13.17 14H7v-2h6.17l-2.58-2.59L12 8l5 5z'],
);
export const cloudflareIcon: DiagramIconDefinition = iconFromPaths(
  'cloudflare',
  'network',
  '0 0 24 24',
  ['M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'],
);
export const cloudIcon: DiagramIconDefinition = iconFromPaths(
  'cloud',
  'network',
  '0 0 24 24',
  ['M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'],
);
export const routerIcon: DiagramIconDefinition = iconFromPaths(
  'router',
  'network',
  '0 0 24 24',
  ['M19 13h-4V7h4v6zm-6 0H9V7h4v6zm-6 0H3V7h4v6zm16 4H1v2h22v-2z'],
);
export const globeIcon: DiagramIconDefinition = iconFromPaths(
  'globe',
  'network',
  '0 0 24 24',
  ['M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 17.93V17a3 3 0 0 0-3-3h-1v-2h2a1 1 0 0 0 1-1V9a2 2 0 0 0-2-2H8.07A8 8 0 0 1 19.8 14.36 7.9 7.9 0 0 1 13 19.93z'],
);

// Cloud Platforms & Tools
export const awsIcon: DiagramIconDefinition = iconFromPaths(
  'aws',
  'cloud',
  '0 0 24 24',
  ['M7.05 13.5l1.6-4.5h2.1l1.6 4.5h-1.6l-.3-1h-1.5l-.3 1H7.05zm2.1-2.4h1.1l-.5-1.7-.6 1.7zm5.55 2.4l-1.3-4.5h1.7l.8 3.1.8-3.1h1.7l-1.3 4.5h-2.4zm-11.4 3.7c4.6 2.6 11.2 2.6 15.8 0l.7 1.4c-5.2 3-12 3-17.2 0l.7-1.4z'],
);
export const gcpIcon: DiagramIconDefinition = iconFromPaths(
  'gcp',
  'cloud',
  '0 0 24 24',
  ['M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'],
);
export const azureIcon: DiagramIconDefinition = iconFromPaths(
  'azure',
  'cloud',
  '0 0 24 24',
  ['M13.05 4.24l-5.6 10.32L2 16.24l9.1-12zm2.14 2.82L9.2 19.76h10.55l-4.56-12.7z'],
);
export const dockerIcon: DiagramIconDefinition = iconFromPaths(
  'docker',
  'cloud',
  '0 0 24 24',
  ['M22 13c-.3 0-.6.1-.8.2-.5-.8-1.4-1.3-2.4-1.3-.4 0-.8.1-1.1.2-.5-1-1.6-1.7-2.8-1.7-.4 0-.8.1-1.2.2V7H4v5H2v2c0 3.9 3.1 7 7 7h6c4.4 0 8-3.6 8-8 0-.3 0-.7-.1-1H22v-1zM5 8h2v2H5V8zm3 0h2v2H8V8zm3 0h2v2h-2V8zm-6 3h2v2H5v-2zm3 0h2v2H8v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2z'],
);
export const kubernetesIcon: DiagramIconDefinition = iconFromPaths(
  'kubernetes',
  'cloud',
  '0 0 24 24',
  ['M12 2l8.66 5v10L12 22l-8.66-5V7L12 2zm0 2.31L4.84 8.5v7l7.16 4.19 7.16-4.19V8.5L12 4.31zm0 4.19l3.5 2v4l-3.5 2-3.5-2v-4l3.5-2z'],
);

// Security
export const lockIcon: DiagramIconDefinition = iconFromPaths(
  'lock',
  'security',
  '0 0 24 24',
  ['M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'],
);
export const shieldIcon: DiagramIconDefinition = iconFromPaths(
  'shield',
  'security',
  '0 0 24 24',
  ['M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.25 6 2.25v4.78z'],
);
export const keyIcon: DiagramIconDefinition = iconFromPaths(
  'key',
  'security',
  '0 0 24 24',
  ['M7 14A5 5 0 1 1 12 9c0 .4-.05.8-.14 1.17l5.43 5.43v2.4h2.4v2.4h2.4v2.4h-3.83L11.83 16A5 5 0 0 1 7 14zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
);

// Observability
export const monitoringIcon: DiagramIconDefinition = iconFromPaths(
  'monitoring',
  'monitoring',
  '0 0 24 24',
  ['M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z'],
);
export const grafanaIcon: DiagramIconDefinition = iconFromPaths(
  'grafana',
  'monitoring',
  '0 0 24 24',
  ['M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-6h2v6zm0-8h-2V6h2v2z'],
);
export const prometheusIcon: DiagramIconDefinition = iconFromPaths(
  'prometheus',
  'monitoring',
  '0 0 24 24',
  ['M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3c2.5 0 4.5 2 4.5 4.5S14.5 14 12 14s-4.5-2-4.5-4.5S9.5 5 12 5zm-5 11.5c.8-1.5 2.8-2.5 5-2.5s4.2 1 5 2.5a8 8 0 0 1-10 0z'],
);
export const bellIcon: DiagramIconDefinition = iconFromPaths(
  'bell',
  'monitoring',
  '0 0 24 24',
  ['M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'],
);

// Languages & Frameworks
export const reactIcon: DiagramIconDefinition = iconFromPaths(
  'react',
  'framework',
  '0 0 24 24',
  ['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-7c-5.5 0-9 2.5-9 5.5s3.5 5.5 9 5.5 9-2.5 9-5.5-3.5-5.5-9-5.5zm0 18c-5.5 0-9-2.5-9-5.5s3.5-5.5 9-5.5 9 2.5 9 5.5-3.5 5.5-9 5.5z'],
);
export const nextjsIcon: DiagramIconDefinition = iconFromPaths(
  'nextjs',
  'framework',
  '0 0 24 24',
  ['M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1.5 14.5l-3.5-5.5h2l2.5 4 4-7.5h2l-5.5 9h-1.5z'],
);
export const nodejsIcon: DiagramIconDefinition = iconFromPaths(
  'nodejs',
  'framework',
  '0 0 24 24',
  ['M12 2l9 5.2v10.4l-9 5.2-9-5.2V7.2L12 2zm0 2.3L4.8 8.5v7l7.2 4.2 7.2-4.2v-7L12 4.3z'],
);
export const pythonIcon: DiagramIconDefinition = iconFromPaths(
  'python',
  'framework',
  '0 0 24 24',
  ['M12 2c-3.3 0-5 1.5-5 3.5v2h5v1H6C3.8 8.5 2 10.3 2 12.5S3.8 16.5 6 16.5h2v-2c0-1.7 1.3-3 3-3h5v-1h-4V8h5c2.2 0 4-1.8 4-4s-1.8-4-4-4h-5zm-2 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 16c3.3 0 5-1.5 5-3.5v-2h-5v-1h6c2.2 0 4-1.8 4-4s-1.8-4-4-4h-2v2c0 1.7-1.3 3-3 3h-5v1h4v2.5h-5c-2.2 0-4 1.8-4 4s1.8 4 4 4h5zm2-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z'],
);
export const goIcon: DiagramIconDefinition = iconFromPaths(
  'go',
  'framework',
  '0 0 24 24',
  ['M3 13h5v-2H3v2zm0-4h8V7H3v2zm0 8h3v-2H3v2zm13-8h5v2h-5V9zm0 4h3v2h-3v-2zm-3-6h8v2h-8V7z'],
);
export const rustIcon: DiagramIconDefinition = iconFromPaths(
  'rust',
  'framework',
  '0 0 24 24',
  ['M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.5 14.5L13 13h-2v3.5H9V7.5h4.5a3 3 0 0 1 2 5.5l2 3.5h-2zm-2-5.5h-2.5v-2H13a1 1 0 0 1 0 2z'],
);
export const graphqlIcon: DiagramIconDefinition = iconFromPaths(
  'graphql',
  'framework',
  '0 0 24 24',
  ['M12 2l8.66 5v10L12 22l-8.66-5V7L12 2zm0 3.2L5.8 8.8v6.4l6.2 3.6 6.2-3.6V8.8L12 5.2z'],
);

// General UI
export const zapIcon: DiagramIconDefinition = iconFromPaths(
  'zap',
  'misc',
  '0 0 24 24',
  ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
);
export const sparklesIcon: DiagramIconDefinition = iconFromPaths(
  'sparkles',
  'misc',
  '0 0 24 24',
  ['M12 2l2.4 7.2L21.6 12l-7.2 2.4L12 21.6l-2.4-7.2L2.4 12l7.2-2.4L12 2z'],
);
export const layersIcon: DiagramIconDefinition = iconFromPaths(
  'layers',
  'misc',
  '0 0 24 24',
  ['M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'],
);
