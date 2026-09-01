import type { DiagramIconDefinition, IconRegistry } from './types';
import * as icons from './icons';
import * as arch from './architecture';
import { lucideIconNames } from './lucide';
import { tablerIconNames } from './tabler';

export const iconRegistry: IconRegistry = {
  // Clients
  user: icons.userIcon,
  users: icons.usersIcon,
  browser: icons.browserIcon,
  mobile: icons.mobileIcon,
  laptop: icons.laptopIcon,
  terminal: icons.terminalIcon,
  bot: icons.botIcon,

  // Compute
  service: icons.serviceIcon,
  worker: icons.workerIcon,
  server: icons.serverIcon,
  container: icons.containerIcon,
  lambda: icons.lambdaIcon,
  code: icons.codeIcon,
  cpu: icons.cpuIcon,

  // Storage
  database: icons.databaseIcon,
  postgresql: icons.postgresqlIcon,
  mysql: icons.mysqlIcon,
  redis: icons.redisIcon,
  cache: icons.cacheIcon,
  mongodb: icons.mongodbIcon,
  elasticsearch: icons.elasticsearchIcon,
  object_storage: icons.objectStorageIcon,
  s3: icons.s3Icon,
  search: icons.searchIcon,

  // Messaging
  queue: icons.queueIcon,
  kafka: icons.kafkaIcon,
  rabbitmq: icons.rabbitmqIcon,
  sqs: icons.sqsIcon,

  // Network
  api_gateway: icons.apiGatewayIcon,
  load_balancer: icons.loadBalancerIcon,
  cdn: icons.cdnIcon,
  cloudflare: icons.cloudflareIcon,
  cloud: icons.cloudIcon,
  router: icons.routerIcon,
  globe: icons.globeIcon,

  // Cloud
  aws: icons.awsIcon,
  gcp: icons.gcpIcon,
  azure: icons.azureIcon,
  docker: icons.dockerIcon,
  kubernetes: icons.kubernetesIcon,

  // Security
  lock: icons.lockIcon,
  shield: icons.shieldIcon,
  key: icons.keyIcon,

  // Observability
  monitoring: icons.monitoringIcon,
  grafana: icons.grafanaIcon,
  prometheus: icons.prometheusIcon,
  bell: icons.bellIcon,

  // Frameworks
  react: icons.reactIcon,
  nextjs: icons.nextjsIcon,
  nodejs: icons.nodejsIcon,
  python: icons.pythonIcon,
  go: icons.goIcon,
  rust: icons.rustIcon,
  graphql: icons.graphqlIcon,

  // Misc
  zap: icons.zapIcon,
  sparkles: icons.sparklesIcon,
  layers: icons.layersIcon,

  // ─── Colored architecture glyphs (polished visual system) ─────────────────
  // These are abstract illustrations, not brand logos. They override the
  // outline versions of the same concept where a colored, illustrated
  // rendering reads better at the new node sizes.
  orchestrator: arch.orchestratorIcon,
  compute_service: arch.computeServiceIcon,
  lambda_box: arch.lambdaBoxIcon,
  container_box: arch.containerBoxIcon,
  cog: arch.cogIcon,
  key_value: arch.keyValueIcon,
  sql_db: arch.sqlDbIcon,
  search_index: arch.searchIndexIcon,
  bucket: arch.bucketIcon,
  cache_colored: arch.cacheIconColored,
  event_stream: arch.eventStreamIcon,
  queue_stack: arch.queueStackIcon,
  gateway_colored: arch.gatewayIconColored,
  load_balancer_colored: arch.loadBalancerIconColored,
  globe_colored: arch.globeIconColored,
  cloud_colored: arch.cloudIconColored,
  user_colored: arch.userIconColored,
  mobile_colored: arch.mobileIconColored,
  browser_colored: arch.browserIconColored,
  lock_colored: arch.lockIconColored,
  shield_colored: arch.shieldIconColored,
  monitoring_colored: arch.monitoringIconColored,
  bell_colored: arch.bellIconColored,
};

/**
 * Third-party icon entries — Lucide and Tabler. These are stubs in the
 * registry (just metadata pointing at the React component name) so the
 * IconPickerModal can list them. The actual SVG drawing happens in the
 * consumer via {@link getLucideIcon} / {@link getTablerIcon}, not through
 * the `nodes` field, because both libraries ship as React components.
 */
for (const name of lucideIconNames) {
  const slug = 'lucide:' + name;
  if (!(slug in iconRegistry)) {
    iconRegistry[slug] = {
      name,
      category: classifyLucide(name),
      viewBox: '0 0 24 24',
      nodes: [], // rendered via React component, not nodes
      source: 'lucide',
    };
  }
}

for (const name of tablerIconNames) {
  const slug = 'tabler:' + name;
  if (!(slug in iconRegistry)) {
    iconRegistry[slug] = {
      name,
      category: classifyTabler(name),
      viewBox: '0 0 24 24',
      nodes: [],
      source: 'tabler',
    };
  }
}

function classifyLucide(name: string): 'client' | 'compute' | 'storage' | 'messaging' | 'network' | 'security' | 'cloud' | 'framework' | 'monitoring' | 'misc' {
  const n = name.toLowerCase();
  if (n.includes('server') || n.includes('cpu') || n.includes('microchip') || n.includes('circuit') || n.includes('cog') || n.includes('settings') || n.includes('wrench') || n.includes('hammer') || n.includes('hard') || n.includes('container') || n.includes('box') || n.includes('plug') || n.includes('power') || n.includes('workflow') || n.includes('antenna')) return 'compute';
  if (n.includes('database') || n.includes('archive') || n.includes('folder') || n.includes('file') || n.includes('search') || n.includes('filter') || n.includes('bar') || n.includes('chart') || n.includes('line') || n.includes('pie') || n.includes('save')) return 'storage';
  if (n.includes('cloud') || n.includes('globe') || n.includes('network') || n.includes('wifi') || n.includes('satellite') || n.includes('radio') || n.includes('rss') || n.includes('webhook') || n.includes('waypoints') || n.includes('route') || n.includes('link')) return 'network';
  if (n.includes('mail') || n.includes('message') || n.includes('send') || n.includes('inbox') || n.includes('at') || n.includes('hash') || n.includes('tag') || n.includes('bookmark')) return 'messaging';
  if (n.includes('lock') || n.includes('shield') || n.includes('key')) return 'security';
  if (n.includes('bell') || n.includes('activity') || n.includes('eye') || n.includes('alert')) return 'monitoring';
  if (n.includes('code') || n.includes('terminal') || n.includes('git')) return 'compute';
  if (n.includes('user') || n.includes('phone') || n.includes('bot') || n.includes('laptop') || n.includes('monitor') || n.includes('smartphone') || n.includes('tablet') || n.includes('watch') || n.includes('camera') || n.includes('headphones') || n.includes('speaker') || n.includes('mic') || n.includes('video')) return 'client';
  if (n.includes('building') || n.includes('factory') || n.includes('house') || n.includes('home')) return 'client';
  if (n.includes('layer') || n.includes('zap') || n.includes('sparkles') || n.includes('rocket') || n.includes('star') || n.includes('heart') || n.includes('sun') || n.includes('moon')) return 'misc';
  return 'misc';
}

function classifyTabler(name: string): 'client' | 'compute' | 'storage' | 'messaging' | 'network' | 'security' | 'cloud' | 'framework' | 'monitoring' | 'misc' {
  const n = name.toLowerCase().replace(/^icon/, '');
  if (n.includes('server') || n.includes('cpu') || n.includes('microchip') || n.includes('circuit') || n.includes('container') || n.includes('box') || n.includes('package') || n.includes('router') || n.includes('accesspoint') || n.includes('antenna') || n.includes('wrench') || n.includes('cog') || n.includes('plug')) return 'compute';
  if (n.includes('database') || n.includes('archive') || n.includes('folder') || n.includes('file')) return 'storage';
  if (n.includes('cloud') || n.includes('globe') || n.includes('network') || n.includes('topology') || n.includes('world') || n.includes('wifi') || n.includes('bluetooth')) return 'cloud';
  if (n.includes('route') || n.includes('road') || n.includes('sitemap') || n.includes('map') || n.includes('compass') || n.includes('waypoints') || n.includes('link') || n.includes('webhook') || n.includes('rss') || n.includes('share')) return 'network';
  if (n.includes('mail') || n.includes('message') || n.includes('send') || n.includes('inbox') || n.includes('at') || n.includes('hash') || n.includes('tag') || n.includes('bookmark')) return 'messaging';
  if (n.includes('lock') || n.includes('shield') || n.includes('key') || n.includes('password') || n.includes('fingerprint') || n.includes('scan')) return 'security';
  if (n.includes('activity') || n.includes('chart') || n.includes('bell') || n.includes('alert') || n.includes('eye') || n.includes('heartbeat')) return 'monitoring';
  if (n.includes('code') || n.includes('terminal') || n.includes('git') || n.includes('brand')) return 'framework';
  if (n.includes('building') || n.includes('home') || n.includes('smarthome') || n.includes('user') || n.includes('phone') || n.includes('robot')) return 'client';
  if (n.includes('sun') || n.includes('moon') || n.includes('star') || n.includes('heart') || n.includes('rocket') || n.includes('flame') || n.includes('bolt') || n.includes('layer') || n.includes('stack') || n.includes('hierarchy') || n.includes('binarytree') || n.includes('palette') || n.includes('brush') || n.includes('pencil') || n.includes('search') || n.includes('filter') || n.includes('sort') || n.includes('adjustments') || n.includes('slider')) return 'misc';
  return 'misc';
}

export function getIcon(name: string): DiagramIconDefinition {
  return iconRegistry[name] ?? iconRegistry['service'];
}

export function getAllIcons(): DiagramIconDefinition[] {
  return Object.values(iconRegistry);
}

export function searchIcons(query: string = '', category?: string): DiagramIconDefinition[] {
  const q = query.toLowerCase().trim();
  return getAllIcons().filter((icon) => {
    const matchesQuery = !q || icon.name.toLowerCase().includes(q) || icon.category.toLowerCase().includes(q);
    const matchesCategory = !category || category === 'all' || icon.category === category;
    return matchesQuery && matchesCategory;
  });
}
