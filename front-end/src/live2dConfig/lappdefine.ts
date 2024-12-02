/**
 * 版权所有(c) Live2D Inc. 保留所有权利。
 *
 * 本源代码的使用受Live2D开源软件许可证的约束，
 * 该许可证可在https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html找到。
 */

import { LogLevel } from '@/framework/live2dcubismframework';

/**
 * Sample App中使用的常量
 */

// 画布宽度和高度的像素值，或动态屏幕大小（'auto'）。
export const CanvasSize: { width: number; height: number } | 'auto' = 'auto';

// 画面
export const ViewScale = 1.0;
export const ViewMaxScale = 2.0;
export const ViewMinScale = 0.8;

export const ViewLogicalLeft = -1.0;
export const ViewLogicalRight = 1.0;
export const ViewLogicalBottom = -1.0;
export const ViewLogicalTop = 1.0;

export const ViewLogicalMaxLeft = -2.0;
export const ViewLogicalMaxRight = 2.0;
export const ViewLogicalMaxBottom = -2.0;
export const ViewLogicalMaxTop = 2.0;

// 相对路径
export const ResourcesPath = '../../Resources/';



// 模型定义---------------------------------------------
// 放置模型的目录名数组
// 目录名和model3.json的名称保持一致
export const ModelDir: string[] = [
  // 'Haru',
  // 'Hiyori',
  // 'Mark',
  // 'Natori',
  // 'Rice',
  "兔兔-阿米娅",
  // 'xiangzi',
  'Mao',
  'Wanko'
];
export const ModelDirSize: number = ModelDir.length;

// 与外部定义文件（json）匹配
export const MotionGroupIdle = 'Idle'; // 待机
export const MotionGroupTapBody = 'TapBody'; // 点击身体时

// 与外部定义文件（json）匹配
export const HitAreaNameHead = 'Head';
export const HitAreaNameBody = 'Body';

// 动作优先级常量
export const PriorityNone = 0;
export const PriorityIdle = 1;
export const PriorityNormal = 2;
export const PriorityForce = 3;

// MOC3的一致性验证选项
export const MOCConsistencyValidationEnable = true;

// 调试日志显示选项
export const DebugLogEnable = true;
export const DebugTouchLogEnable = false;

// Framework输出的日志级别设置
export const CubismLoggingLevel: LogLevel = LogLevel.LogLevel_Verbose;

// 默认的渲染目标大小
export const RenderTargetWidth = 1900;
export const RenderTargetHeight = 1000;