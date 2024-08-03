"use client";
import { SentRecord as ProcessableRecord } from "@/interfaces/sent-record";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";

type ProcessableRecordsProps = {
  processableRecords: ProcessableRecord[];
};

const ProcessableRecords = ({
  processableRecords,
}: ProcessableRecordsProps) => {
  if (processableRecords.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary">
        No records available.
      </Typography>
    );
  }

  return (
    <List>
      {processableRecords.map((record, index) => {
        // Note: this is just a placeholder because we don't really upload audio files to s3 or processing the recorded audio
        const url = URL.createObjectURL(record.audio);
        const audio = new Audio(url);
        return (
          <Box key={index}>
            <Divider />
            <ListItem>
              <ListItemText
                primary={record.audioFilePath}
                secondary={"Original Record"}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="play"
                  onClick={() => audio.play()}
                >
                  <PlayArrowIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => audio.pause()}
                >
                  <StopIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem>
              <ListItemText
                primary={`${
                  record.correctedAudioFilePath ||
                  `Processing ${record.audioFilePath}`
                }`}
                secondary={"Processed Record"}
              />
              {record.correctedAudioFilePath ? (
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="play"
                    onClick={() => audio.play()}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => audio.pause()}
                  >
                    <StopIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              ) : (
                <ListItemSecondaryAction>
                  <CircularProgress size={20} />
                </ListItemSecondaryAction>
              )}
            </ListItem>
          </Box>
        );
      })}
    </List>
  );
};

export { ProcessableRecords };
