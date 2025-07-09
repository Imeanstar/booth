import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Dialog({ children, ...props }) {
  return <RadixDialog.Root {...props}>{children}</RadixDialog.Root>;
}

export function DialogTrigger({ children, ...props }) {
  return <RadixDialog.Trigger {...props}>{children}</RadixDialog.Trigger>;
}

export function DialogContent({ children, ...props }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      <RadixDialog.Content
        className="fixed left-[50%] top-[50%] z-50 grid w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg rounded-xl"
        {...props}
      >
        {children}
        <RadixDialog.Close className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({ children }) {
  return <div className="text-left">{children}</div>;
}

export function DialogFooter({ children }) {
  return <div className="flex justify-end gap-2 pt-4">{children}</div>;
}

export function DialogTitle({ children }) {
  return (
    <RadixDialog.Title className="text-lg font-semibold pr-4">
      {children}
    </RadixDialog.Title>
  );
}

export function DialogClose({ children, ...props }) {
  return <RadixDialog.Close {...props}>{children}</RadixDialog.Close>;
}
