import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { Partner } from '../../../../models/organization-partner/partner';
import { PartnerService } from '../../../../services/partner.service';
import { PartnerMediaService, PartnerMedia } from '../../../../services/partner-media.service';

@Component({
  selector: 'app-partner-list',
  
  
  templateUrl: './partner-list.component.html',
  styleUrl: './partner-list.component.scss'
})
export class PartnerListComponent implements OnInit {
  partners: Partner[] = [];
  selectedPartner?: Partner;
  selectedMedia?: PartnerMedia | null;
  showModal = false;
  loadingMedia = false;
  safeVideoUrl?: SafeResourceUrl;

  constructor(
    private partnerService: PartnerService,
    private mediaService: PartnerMediaService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.partnerService.getAll().subscribe({
      next: (data) => this.partners = data.filter(p => p.status === 'ACTIVE')
    });
  }

  async openModal(partner: Partner): Promise<void> {
    this.selectedPartner = partner;
    this.showModal = true;
    this.loadingMedia = true;
    this.selectedMedia = null;
    this.safeVideoUrl = undefined;
    try {
      console.log('Recherche media pour partnerId:', partner.id);
      this.selectedMedia = await this.mediaService.getByPartnerId(partner.id!);
      console.log('Media recu:', this.selectedMedia);
      if (this.selectedMedia?.videoUrl) {
        this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.selectedMedia.videoUrl
        );
      }
    } catch (e) {
      console.error('Erreur Firebase:', e);
    } finally {
      this.loadingMedia = false;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPartner = undefined;
    this.selectedMedia = null;
    this.safeVideoUrl = undefined;
  }
}





