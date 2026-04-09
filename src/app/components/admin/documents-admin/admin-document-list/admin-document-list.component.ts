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

  // Modal state
  showUploadForm: boolean = false;
  uploadForm!: FormGroup;
  selectedFile: File | null = null;

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
    this.documentService.approveDocument(documentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Success', 'Document approved successfully');
          this.loadDocuments();
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to approve document');
        }
      });
  }

  rejectDocument(documentId: number): void {
    this.documentService.rejectDocument(documentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Success', 'Document rejected');
          this.loadDocuments();
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
    // Navigate to detail view
  }
}
