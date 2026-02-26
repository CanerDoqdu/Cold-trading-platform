/**
 * Barrel export for all Mongoose models.
 * Import from '@/models' for convenience.
 */

export { default as User } from './User.model';
export type { IUser, IUserDocument, IUserModel } from './User.model';

export { default as Order } from './Order.model';
export type { IOrder, IOrderDocument, IOrderModel, OrderSide, OrderType, OrderStatus } from './Order.model';

export { default as Portfolio } from './Portfolio.model';
export type { IPortfolio, IPortfolioDocument, IPortfolioModel, IHolding } from './Portfolio.model';

export { default as PortfolioSnapshot } from './PortfolioSnapshot.model';
export type { IPortfolioSnapshot, IPortfolioSnapshotDocument, IPortfolioSnapshotModel } from './PortfolioSnapshot.model';

export { default as Session } from './Session.model';
export type { ISession, ISessionDocument, ISessionModel } from './Session.model';

export { default as AuditLog } from './AuditLog.model';
export type { IAuditLog, IAuditLogDocument, IAuditLogModel, AuditAction } from './AuditLog.model';

export { default as PriceAlert } from './PriceAlert.model';
export type { IPriceAlert, IPriceAlertDocument, IPriceAlertModel, AlertCondition } from './PriceAlert.model';

export { default as Notification } from './Notification.model';
export type { INotification, INotificationDocument, INotificationModel, NotificationType } from './Notification.model';

export { default as Coin } from './Coin.model';
export type { ICoin, ICoinDocument, ICoinModel } from './Coin.model';

export { default as PriceHistory } from './PriceHistory.model';
export type { IPriceHistory, IPriceHistoryDocument, IPriceHistoryModel } from './PriceHistory.model';
