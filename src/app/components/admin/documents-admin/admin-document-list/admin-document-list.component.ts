import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DocumentService } from '../../../../services/documents/document.service';
import { DocumentTypeService } from '../../../../services/documents/document-type.service';
import { ToastService } from '../../../../services/shared/toast.service';
import { LegalDocument, DocumentType, Page, DocumentStatusEnum } from '../../../../models/document.model';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-admin-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, PaginationComponent],
  templateUrl: './admin-document-list.component.html',
  styleUrls: ['./admin-document-list.component.css']
})
export class AdminDocumentListComponent implements OnInit, OnDestroy {
  documents: LegalDocument[] = [];
  documentTypes: DocumentType[] = [];
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;

  // Pagination
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;

  // Filters
  statusFilter: string = '';
  documentTypeFilter: string = '';
  userIdFilter: string = '';
  dateFromFilter: string = '';
  dateToFilter: string = '';
  searchFilter: string = ''; // Search by filename

  // Modal state
  showUploadForm: boolean = false;
  uploadForm!: FormGroup;
  selectedFile: File | null = null;

  // Document detail modal state
  showDetailModal: boolean = false;
  selectedDocument: LegalDocument | null = null;

  // Direct URL base for files served from htdocs
  private fileServerUrl = 'http://localhost:8081/pidev-uploads/';

  private destroy$ = new Subject<void>();

  constructor(
    public documentService: DocumentService,
    private documentTypeService: DocumentTypeService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.loading$ = this.documentService.loading$;
    this.error$ = this.documentService.error$;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadDocuments();
    this.loadDocumentTypes();

    // Subscribe to document types from service
    this.documentTypeService.documentTypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(types => {
        console.log('✅ Document types received:', types);
        this.documentTypes = types;
      });
  }

  /**
   * Filter documents based on search term (filename/document name)
   * This is a client-side filter for instant search results
   */
  get filteredDocuments(): LegalDocument[] {
    if (!this.searchFilter.trim()) {
      return this.documents;
    }

    const searchTerm = this.searchFilter.toLowerCase();
    return this.documents.filter(doc => {
      // Search by document type name
      const docTypeMatch = doc.documentType.name.toLowerCase().includes(searchTerm);
      // Search by user ID
      const userIdMatch = doc.userId.toString().includes(searchTerm);
      // Search by document ID
      const docIdMatch = doc.id?.toString().includes(searchTerm);
      // Search by filename (if available in documentUrl)
      const filenameMatch = doc.documentUrl.toLowerCase().includes(searchTerm);

      return docTypeMatch || userIdMatch || docIdMatch || filenameMatch;
    });
  }

  onSearchChange(): void {
    // Client-side search, no need to reload documents
    // The search filter is applied via the filteredDocuments getter
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.uploadForm = this.fb.group({
      documentTypeId: ['', Validators.required],
      description: [''],
      expiryDate: [''],
      file: ['', Validators.required]
    });
  }

  openUploadModal(): void {
    this.showUploadForm = true;
    this.initializeForm();
    this.selectedFile = null;
  }

  closeModal(): void {
    this.showUploadForm = false;
    this.uploadForm.reset();
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    console.log('🟡 onFileSelected called');
    this.selectedFile = event.target.files[0] || null;
    console.log('🟡 Selected file:', this.selectedFile);

    if (this.selectedFile) {
      // Update the form control to mark it as having a value
      this.uploadForm.patchValue({ file: this.selectedFile.name });
      console.log('✅ Form updated with file:', this.selectedFile.name);
    }
  }

  uploadDocument(): void {
    console.log('🟡 uploadDocument() called');
    console.log('🟡 Form valid:', this.uploadForm.valid);
    console.log('🟡 Selected file:', this.selectedFile);

    if (!this.uploadForm.valid || !this.selectedFile) {
      console.error('❌ Validation failed');
      this.toastService.error('Error', 'Please fill all required fields and select a file');
      return;
    }

    // Validate expiry date if required
    if (this.isExpiryRequired()) {
      const expiryDate = this.uploadForm.get('expiryDate')?.value;
      if (!expiryDate) {
        this.toastService.error('Error', 'Expiry date is required for this document type');
        return;
      }
    }

    const documentTypeId = parseInt(this.uploadForm.get('documentTypeId')?.value);
    const expiryDate = this.uploadForm.get('expiryDate')?.value || undefined;
    console.log('✅ Uploading with documentTypeId:', documentTypeId);
    console.log('✅ File:', this.selectedFile);
    console.log('✅ Expiry date:', expiryDate);

    this.documentService
      .uploadDocument(documentTypeId, this.selectedFile, expiryDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Document uploaded successfully:', response);
          this.toastService.success('Success', 'Document uploaded successfully');
          this.closeModal();
          this.loadDocuments();
        },
        error: (error) => {
          console.error('❌ Error uploading document:', error);
          this.toastService.error('Error', 'Failed to upload document: ' + (error?.message || 'Unknown error'));
        }
      });
  }

  isExpiryRequired(): boolean {
    const documentTypeId = this.uploadForm.get('documentTypeId')?.value;
    if (documentTypeId) {
      const selectedType = this.documentTypes.find(dt => dt.id === parseInt(documentTypeId));
      return selectedType?.requiresExpiry || false;
    }
    return false;
  }

  loadDocuments(): void {
    console.log('🟡 loadDocuments() called from admin document list');
    const criteria = {
      page: this.currentPage,
      size: this.pageSize,
      status: (this.statusFilter as DocumentStatusEnum) || undefined,
      documentTypeId: this.documentTypeFilter ? parseInt(this.documentTypeFilter) : undefined,
      userId: this.userIdFilter ? parseInt(this.userIdFilter) : undefined
    };

    this.documentService
      .searchDocuments(criteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          console.log('✅ Admin documents loaded:', page.content);
          this.documents = page.content;
          this.totalElements = page.totalElements;
        },
        error: (error) => {
          console.error('❌ Error loading admin documents:', error);
          this.toastService.error('Error', 'Failed to load documents: ' + (error?.message || 'Unknown error'));
        }
      });
  }

  loadDocumentTypes(): void {
    console.log('🟡 loadDocumentTypes() called from admin document list');
    this.documentTypeService
      .getDocumentTypes(0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          console.log('✅ Document types loaded:', page.content);
          this.documentTypes = page.content;
          console.log('✅ documentTypes property updated:', this.documentTypes);
        },
        error: (error) => {
          console.error('❌ Error loading document types:', error);
          this.toastService.error('Error', 'Failed to load document types: ' + (error?.message || 'Unknown error'));
        }
      });
  }

  onStatusFilterChange(): void {
    this.currentPage = 0;
    this.loadDocuments();
  }

  onDocumentTypeFilterChange(): void {
    this.currentPage = 0;
    this.loadDocuments();
  }

  onDateFilterChange(): void {
    this.currentPage = 0;
    this.loadDocuments();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDocuments();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadDocuments();
  }

  approveDocument(documentId: number): void {
    // Get the document to check its current status
    const document = this.selectedDocument;

    if (!document) {
      this.toastService.error('Error', 'Document not found');
      return;
    }

    // If the document is REJECTED, use toggle endpoint
    // If the document is PENDING, use approve endpoint
    const approvalRequest = document.status === 'REJECTED'
      ? this.documentService.toggleDocumentStatus(documentId)
      : this.documentService.approveDocument(documentId);

    approvalRequest
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedDoc) => {
          const statusMsg = updatedDoc.status === 'VALID' ? 'approved' : 'toggled to approved';
          this.toastService.success('Success', `Document ${statusMsg} successfully`);
          // Update the document in the list
          const index = this.documents.findIndex(d => d.id === documentId);
          if (index !== -1) {
            this.documents[index] = updatedDoc;
          }
          // Update selected document if it's opened in modal
          if (this.selectedDocument?.id === documentId) {
            this.selectedDocument = updatedDoc;
          }
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to approve document');
        }
      });
  }

  rejectDocument(documentId: number): void {
    // Get the document to check its current status
    const document = this.selectedDocument;

    if (!document) {
      this.toastService.error('Error', 'Document not found');
      return;
    }

    // If the document is VALID, use toggle endpoint
    // If the document is PENDING, use reject endpoint
    const rejectRequest = document.status === 'VALID'
      ? this.documentService.toggleDocumentStatus(documentId)
      : this.documentService.rejectDocument(documentId);

    rejectRequest
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedDoc) => {
          this.toastService.success('Success', 'Document rejected');
          // Update the document in the list
          const index = this.documents.findIndex(d => d.id === documentId);
          if (index !== -1) {
            this.documents[index] = updatedDoc;
          }
          // Update selected document if it's opened in modal
          if (this.selectedDocument?.id === documentId) {
            this.selectedDocument = updatedDoc;
          }
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to reject document');
        }
      });
  }

  requestUpdate(documentId: number): void {
    const feedback = prompt('Enter feedback for update:');
    if (feedback) {
      this.documentService.requestDocumentUpdate(documentId, feedback)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('Success', 'Update request sent');
            this.loadDocuments();
          },
          error: (err) => {
            this.toastService.error('Error', err.message || 'Failed to request update');
          }
        });
    }
  }

  viewDocumentDetails(documentId: number): void {
    const document = this.documents.find(d => d.id === documentId);
    if (document) {
      this.selectedDocument = document;
      this.showDetailModal = true;
    }
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDocument = null;
  }

  /**
   * Open the actual document file (PDF, JPG, etc.) in a new window using direct URL
   */
  viewDocumentFile(): void {
    if (this.selectedDocument?.documentUrl) {
      // Construct direct URL from relative path
      const directUrl = this.fileServerUrl + this.selectedDocument.documentUrl;
      window.open(directUrl, '_blank');
    } else {
      this.toastService.error('Error', 'Document URL not available');
    }
  }

  /**
   * Download the document file using direct URL
   */
  downloadDocumentFile(): void {
    if (this.selectedDocument?.documentUrl) {
      // Construct direct URL from relative path
      const directUrl = this.fileServerUrl + this.selectedDocument.documentUrl;
      const link = document.createElement('a');
      link.href = directUrl;
      link.download = `document-${this.selectedDocument.id}`;
      link.click();
    } else {
      this.toastService.error('Error', 'Document URL not available');
    }
  }

  /**
   * Get status badge color
   */
  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'VALID':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'EXPIRED':
        return 'secondary';
      default:
        return 'info';
    }
  }
}
