import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Alert,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { storage, db } from '../utils/firebase';

// Light purple theme color
const MAIN_COLOR = '#b39ddb'; // light purple
const MAIN_COLOR_DARK = '#9575cd'; // darker purple for hover

const Container = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  minHeight: '100vh',
  backgroundColor: '#fff', // white background
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}));

const Header = styled(Box)(({ theme }) => ({
  backgroundColor: MAIN_COLOR,
  color: '#222',
  padding: '28px 16px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  fontSize: '2rem',
  fontWeight: 700,
  letterSpacing: 1,
  boxShadow: '0 2px 8px rgba(179,157,219,0.15)'
}));

const BackButton = styled(Button)(({ theme }) => ({
  color: '#222',
  minWidth: 'auto',
  padding: '12px',
  position: 'absolute',
  left: '8px',
  fontSize: '1.5rem'
}));

const Content = styled(Box)(({ theme }) => ({
  padding: '32px 10px',
  maxWidth: '700px',
  margin: '0 auto'
}));

const DocumentCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '20px',
  padding: '28px 20px',
  marginBottom: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(179,157,219,0.13)',
  border: `2px solid ${MAIN_COLOR}`,
  transition: 'background 0.2s, box-shadow 0.2s',
  '&:hover': {
    backgroundColor: '#ede7f6'
  }
}));

const DocumentInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '24px'
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '16px'
}));

const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: MAIN_COLOR,
  color: '#222',
  fontWeight: 700,
  fontSize: '1.2rem',
  padding: '18px 0',
  borderRadius: '14px',
  marginTop: '18px',
  '&:hover': {
    backgroundColor: MAIN_COLOR_DARK
  }
}));

const HiddenInput = styled('input')({
  display: 'none'
});

const documentCategories = [
  'Identity Documents',
  'Medical Records',
  'Insurance Papers',
  'Prescriptions',
  'Other'
];

const Documents = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    category: 'Other',
    file: null
  });
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [futureScopeDialogOpen, setFutureScopeDialogOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [currentUser]);

  const fetchDocuments = async () => {
    try {
      const q = query(
        collection(db, 'documents'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const docs = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        docs.push({
          id: doc.id,
          ...data,
          date: data.timestamp?.toDate() || new Date()
        });
      }
      setDocuments(docs.sort((a, b) => b.date - a.date));
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewDocument(prev => ({
        ...prev,
        file,
        name: file.name.split('.')[0]
      }));
      setUploadDialogOpen(true);
    }
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper to close dialog and reset upload state
  const closeUploadDialog = () => {
    setUploadDialogOpen(false);
    setIsUploading(false);
    setUploadProgress(0);
    setNewDocument({ name: '', category: 'Other', file: null });
  };

  // Helper to upload file and return download URL
  const uploadFileAndGetURL = (storageRef, file, setUploadProgress) => {
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(storageRef);
            resolve(downloadURL);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  };

  const handleUpload = async () => {
    setFutureScopeDialogOpen(true);
    // Do not proceed with upload logic
  };

  const handleDelete = async (document) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        // Delete from Storage
        const storageRef = ref(storage, `documents/${currentUser.uid}/${document.fileName}`);
        await deleteObject(storageRef);

        // Delete from Firestore
        await deleteDoc(doc(db, 'documents', document.id));

        setSuccess('Document deleted successfully');
        fetchDocuments();
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete document');
      }
    }
  };

  const handleView = (document) => {
    window.open(document.fileUrl, '_blank');
  };

  // Download handler
  const handleDownload = (document) => {
    const link = document.createElement('a');
    link.href = document.fileUrl;
    link.download = document.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter documents by search
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <Header>
          <Typography variant="h4" sx={{ width: '100%', textAlign: 'center', fontWeight: 700, fontSize: '2.2rem' }}>
            Documents
          </Typography>
        </Header>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress size={80} thickness={5} sx={{ color: MAIN_COLOR }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton startIcon={<ArrowBackIcon sx={{ fontSize: 32 }} />} onClick={() => navigate('/')}>
        </BackButton>
        <Typography variant="h4" sx={{ width: '100%', textAlign: 'center', fontWeight: 700, fontSize: '2.2rem' }}>
          Documents
        </Typography>
      </Header>

      <Content>
        {/* Search bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ style: { fontSize: '1.2rem', background: '#f5f5f5', borderRadius: 8 } }}
            sx={{ fontSize: '1.2rem' }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, fontSize: '1.2rem' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, fontSize: '1.2rem' }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id}>
              <DocumentInfo>
                <DescriptionIcon sx={{ color: MAIN_COLOR_DARK, fontSize: 44 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: '#222', fontWeight: 700, fontSize: '1.4rem' }}>
                    {doc.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: MAIN_COLOR_DARK, fontWeight: 500, fontSize: '1.1rem', display: 'block', mt: 0.5 }}>
                    {doc.category}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', display: 'block', fontSize: '1.1rem', mt: 0.5 }}>
                    {formatDate(doc.date)} • {formatFileSize(doc.size)}
                  </Typography>
                </Box>
              </DocumentInfo>
              <ActionButtons>
                <IconButton 
                  onClick={() => handleView(doc)}
                  size="large"
                  title="View document"
                  sx={{ color: MAIN_COLOR_DARK, fontSize: 32 }}
                >
                  <VisibilityIcon sx={{ fontSize: 32 }} />
                </IconButton>
                <IconButton 
                  onClick={() => handleDownload(doc)}
                  size="large"
                  title="Download document"
                  sx={{ color: '#388e3c', fontSize: 32 }}
                >
                  <DownloadIcon sx={{ fontSize: 32 }} />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(doc)}
                  size="large"
                  title="Delete document"
                  sx={{ color: '#d32f2f', fontSize: 32 }}
                >
                  <DeleteIcon sx={{ fontSize: 32 }} />
                </IconButton>
              </ActionButtons>
            </DocumentCard>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', my: 6 }}>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1.4rem' }}>
              No documents uploaded yet
            </Typography>
          </Box>
        )}

        <HiddenInput
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />

        <UploadButton
          variant="contained"
          fullWidth
          startIcon={<UploadFileIcon sx={{ fontSize: 32 }} />}
          onClick={() => fileInputRef.current.click()}
        >
          Upload New Document
        </UploadButton>

        <Dialog
          open={uploadDialogOpen}
          onClose={() => !isUploading && closeUploadDialog()}
          PaperProps={{ sx: { borderRadius: 4, minWidth: 350 } }}
          disableEscapeKeyDown={isUploading}
          disableBackdropClick={isUploading ? true : undefined}
        >
          <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 700, color: MAIN_COLOR_DARK }}>
            Upload Document
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Document Name"
              fullWidth
              value={newDocument.name}
              onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 3, fontSize: '1.2rem' }}
              InputProps={{ style: { fontSize: '1.2rem' } }}
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
              disabled={isUploading}
            />
            <TextField
              select
              fullWidth
              label="Category"
              value={newDocument.category}
              onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
              sx={{ mb: 2, fontSize: '1.2rem' }}
              InputProps={{ style: { fontSize: '1.2rem' } }}
              InputLabelProps={{ style: { fontSize: '1.2rem' } }}
              disabled={isUploading}
            >
              {documentCategories.map((category) => (
                <MenuItem key={category} value={category} sx={{ fontSize: '1.2rem' }}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 12, borderRadius: 6, background: '#ede7f6' }} />
                <Typography variant="caption" sx={{ mt: 1, fontSize: '1.1rem', color: MAIN_COLOR_DARK }}>
                  Uploading: {Math.round(uploadProgress)}%
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeUploadDialog} sx={{ fontSize: '1.1rem' }} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              sx={{ background: MAIN_COLOR_DARK, color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}
              disabled={isUploading}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        {/* Future Scope Dialog */}
        <Dialog
          open={futureScopeDialogOpen}
          onClose={() => setFutureScopeDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: 4, minWidth: 300 } }}
        >
          <DialogTitle sx={{ fontSize: '1.3rem', fontWeight: 700, color: MAIN_COLOR_DARK }}>
            Coming Soon
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: '1.1rem', mt: 1 }}>
              This feature is part of future scope and is not available yet.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFutureScopeDialogOpen(false)} autoFocus>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Content>
    </Container>
  );
};

export default Documents;