"use client";
import DeleteIcon from "@mui/icons-material/Delete";
import MicIcon from "@mui/icons-material/Mic";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SendIcon from "@mui/icons-material/Send";
import StopIcon from "@mui/icons-material/Stop";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { useRef, useState } from "react";

const mimeType = "audio/webm";

type AudioRecorderProps = {
  isProcessable: boolean;
  record: Blob | null;
  onNewRecord: (recording: Blob | null) => void;
};
const AudioRecorder = ({
  isProcessable,
  record,
  onNewRecord,
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleRecordClick = () => {
    if (isRecording) {
      if (isPaused) {
        mediaRecorderRef.current!.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current!.pause();
        setIsPaused(true);
      }
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    onNewRecord(null);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        chunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        onNewRecord(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    });
  };

  const stopRecording = () => {
    mediaRecorderRef.current!.stop();
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleProcess = () => {
    // Send recording logic here
  };

  const handlePlay = () => {
    const url = URL.createObjectURL(record as Blob);
    const audio = new Audio(url);
    audio.play();
  };

  const handleDelete = () => {
    onNewRecord(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="center" my={4}>
        <IconButton
          color="secondary"
          onClick={handleRecordClick}
          sx={{
            width: 120,
            height: 120,
            border: "4px solid",
            borderColor: "secondary.main",
          }}
        >
          {isRecording ? (
            isPaused ? (
              <MicIcon sx={{ fontSize: 60 }} />
            ) : (
              <PauseIcon sx={{ fontSize: 60 }} />
            )
          ) : (
            <MicIcon sx={{ fontSize: 60 }} />
          )}
        </IconButton>
      </Box>

      <Typography variant="h6" align="center" gutterBottom>
        {isRecording
          ? isPaused
            ? "Paused"
            : "Recording..."
          : "Tap the button to start recording"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
          backgroundColor: "grey.100",
          p: 2,
          borderRadius: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          color="success"
          onClick={handleProcess}
          disabled={!record || !isProcessable}
        >
          Process
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={handlePlay}
          disabled={!record}
        >
          Play
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          disabled={!record}
        >
          Delete
        </Button>
        {isRecording && (
          <Button
            variant="contained"
            startIcon={<StopIcon />}
            onClick={stopRecording}
            color="error"
          >
            Stop
          </Button>
        )}
      </Box>
    </Box>
  );
};

export { AudioRecorder };
