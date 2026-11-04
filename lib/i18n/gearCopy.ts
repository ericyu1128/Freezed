/**
 * Freezed — per-item copy in the current language
 *
 * Catalogue items carry optional `descriptionZh` / `matchReasonZh`. These
 * helpers pick the right one and fall back to English when a translation is
 * missing, so a new item without Chinese copy still renders.
 */

import type { GearItem } from '../types';
import type { Language } from './translations';

export const itemDescription = (item: GearItem, language: Language): string =>
  (language === 'zh' && item.descriptionZh) || item.description;

export const itemMatchReason = (item: GearItem, language: Language): string =>
  (language === 'zh' && item.matchReasonZh) || item.matchReason;

/**
 * Chinese labels for the manufacturer spec keys shown under "Full
 * manufacturer specs". Values stay as the manufacturer writes them
 * (product names and tech terms). Unknown keys fall back to the English
 * camelCase split.
 */
// zh: needs review
const SPEC_KEY_LABEL_ZH: Record<string, string> = {
  waistWidth: '腰宽',
  lengths: '可选长度',
  turnRadius: '回转半径',
  profile: '板型',
  core: '板芯',
  weight: '重量',
  binding: '固定器',
  damping: '减震',
  tail: '板尾',
  construction: '结构',
  skinAttachment: '止滑带卡扣',
  versatility: '适用性',
  flexRating: '硬度等级',
  shape: '板形',
  base: '板底',
  flex: '硬度',
  lastWidth: '鞋楦宽度',
  liner: '内胆',
  soleStandard: '鞋底标准',
  cuffAlignment: '靴筒校准',
  closure: '闭合系统',
  walkMode: '行走模式',
  cuff: '靴筒',
  flexScale: '硬度标尺',
  lacing: '系带系统',
  footbed: '鞋垫',
  outsole: '外底',
  warmth: '保暖等级',
  certification: '安全认证',
  vents: '通风孔',
  ventControl: '通风调节',
  fit: '版型',
  rotational: '防旋转系统',
  vlt: '透光率 (VLT)',
  lensTint: '镜片色调',
  lensShape: '镜片形状',
  lensTech: '镜片技术',
  antiFog: '防雾',
  spareLens: '备用镜片',
  uv: '紫外线防护',
  faceMask: '面罩',
  insulation: '保暖填充',
  waterproofing: '防水',
  seams: '压胶',
  pitZips: '腋下拉链',
  powderSkirt: '防雪裙',
  hood: '帽兜',
  pockets: '口袋',
  dinRange: 'DIN 范围',
  brakeWidth: '止滑器宽度',
  elasticity: '弹性行程',
  material: '材质',
  soleCompatibility: '鞋底兼容',
  highback: '高背',
  baseplate: '底板',
  straps: '绑带',
  compatibility: '安装兼容',
};

export const specKeyLabel = (key: string, language: Language): string =>
  (language === 'zh' && SPEC_KEY_LABEL_ZH[key]) || key.replace(/([A-Z])/g, ' $1').trim();
