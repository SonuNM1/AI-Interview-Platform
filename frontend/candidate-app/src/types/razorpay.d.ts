interface RazorpayOrderResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpaySubscriptionResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayOrderOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  handler: (
    response: RazorpayOrderResponse,
  ) => void | Promise<void>;
  name?: string;
  description?: string;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpaySubscriptionOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (
    response: RazorpaySubscriptionResponse,
  ) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayConstructor {
  new (options: RazorpayOrderOptions): RazorpayInstance;

  new (
    options: RazorpaySubscriptionOptions,
  ): RazorpayInstance;
}

interface Window {
  Razorpay?: RazorpayConstructor;
}