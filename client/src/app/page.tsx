"use client";
import { AudioRecorder } from "@/components/AudioRecorder";
import { EmailInput } from "@/components/EmailInput";
import { ProcessableRecords } from "@/components/ProcessableRecords";
import { SentRecord } from "@/interfaces/sent-record";
import { Grid, Paper, Typography } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [validEmail, setValidEmail] = useState<string | null>(null);
  const [record, setRecord] = useState<Blob | null>(null);
  const [sentRecords, setSentRecords] = useState<SentRecord[]>([
    {
      audio: new Blob(),
      audioFilePath: "test.mp3",
    },
  ]);

  const isSendable = validEmail !== null && record !== null;
  return (
    <main>
      <Grid
        container
        direction={{ xs: "column", sm: "row" }}
        justifyContent={"center"}
        alignItems={"stretch"}
        spacing={4}
        wrap="wrap"
      >
        <Grid item xs={4}>
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom>
              DPM Recorder
            </Typography>

            <EmailInput onNewEmail={(email) => setValidEmail(email)} />
            <AudioRecorder
              isProcessable={isSendable}
              record={record}
              onNewRecord={(record) => setRecord(record)}
            />
          </Paper>
        </Grid>
        <Grid item xs={4} alignSelf={"stretch"}>
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Processed Records
            </Typography>
            <ProcessableRecords processableRecords={sentRecords} />
          </Paper>
        </Grid>
      </Grid>
    </main>
  );
}
