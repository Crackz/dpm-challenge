export interface ProcessableRecordMessage {
  id: string;
}

export interface ProcessedRecordMessage {
  id: string;
  audioFilePath: string;
  correctedAudioFilePath: string;
}
