import { ConversionHistoryEntry } from "@/components/Converter/utils/ConversionHistoryManager/ConversionHistoryManager.ts";

export enum MessageType {
  ConvertBatch = "CONVERT_BATCH",
  BatchFinished = "BATCH_FINISHED",
  Halt = "HALT",
  Halted = "HALTED",
}

export interface Message {
  messageType: MessageType;
}
export interface ConversionTask {
  source: File;
  targetFormat: string;
}

export interface ConversionResult {
  source: File;
  target?: File;
}

export interface BatchConversionMessage extends Message {
  messageType: MessageType.ConvertBatch;
  timeout: number | undefined;
  tasks: ConversionTask[];
}

export interface BatchCompletionMessage extends Message {
  messageType: MessageType.BatchFinished;
  results: ConversionResult[];
  history: Array<ConversionHistoryEntry>;
}

export interface HaltMessage extends Message {
  messageType: MessageType.Halt;
}

export interface HaltNotificationMessage extends Message {
  messageType: MessageType.Halted;
}
