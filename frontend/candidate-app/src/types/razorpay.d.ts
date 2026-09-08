interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: {
    key: string;
    subscription_id: string;
    name: string;
    description: string;
    handler: (response: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
    }) => void | Promise<void>;
    modal?: {
      ondismiss?: () => void;
    };
  }): RazorpayInstance;
}

interface Window {
  Razorpay?: RazorpayConstructor;
}