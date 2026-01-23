import React, { useEffect, useState } from 'react';
import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Typography,
  Paper,
  Box,
  Skeleton,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/CloudDownload';
import { FilesService } from '../../services/files.service';

interface Props {
  patientId: string;
  refreshTrigger: number; // Un contador simple para forzar la recarga
}

export const FileGallery: React.FC<Props> = ({ patientId, refreshTrigger }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [patientId, refreshTrigger]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await FilesService.getPatientFiles(patientId);
      setFiles(data);
    } catch (error) {
      console.error('Error cargando galería:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rectangular" width={100} height={100} />
        <Skeleton variant="rectangular" width={100} height={100} />
      </Box>
    );
  }

  if (files.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No hay radiografías ni documentos.
      </Typography>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f4f8', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        📂 Galería de Evidencia ({files.length})
      </Typography>

      <ImageList
        sx={{ width: '100%', maxHeight: 450 }}
        cols={3}
        rowHeight={164}
      >
        {files.map((item) => (
          <ImageListItem key={item.id}>
            <img
              src={`${item.url}`} // La URL firmada de S3/MinIO
              alt={item.fileName}
              loading="lazy"
              style={{ borderRadius: '8px' }}
            />
            <ImageListItemBar
              title={item.fileName}
              subtitle={<span>{(item.sizeBytes / 1024).toFixed(1)} KB</span>}
              actionIcon={
                <IconButton
                  sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                  aria-label={`info about ${item.fileName}`}
                  component="a"
                  href={item.url}
                  target="_blank"
                >
                  <DownloadIcon />
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Paper>
  );
};
