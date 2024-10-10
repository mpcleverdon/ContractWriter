import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContractService } from '../services/contract.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.page.html',
  styleUrls: ['./contract.page.scss'],
})
export class ContractPage implements OnInit {
  contractForm: FormGroup;
  services = ['Maintenance', 'Cleaning', 'Gardening', 'Pool Cleaning'];

  constructor(
    private formBuilder: FormBuilder,
    private contractService: ContractService
  ) {}

  ngOnInit() {
    this.contractForm = this.formBuilder.group({
      pmcName: ['', Validators.required],
      ownerName: ['', Validators.required],
      propertyAddress: ['', Validators.required],
      selectedServices: this.formBuilder.array(this.services.map(() => false)),
      customTerms: [''],
    });
  }

  async generateContract() {
    if (this.contractForm.valid) {
      const contractData = this.contractForm.value;
      const enhancedTerms = await this.contractService.enhanceTerms(contractData.customTerms);
      const pdfContent = this.generatePdfContent(contractData, enhancedTerms);
      this.generatePdf(pdfContent);
      this.saveContractToDatabase(contractData, enhancedTerms);
    }
  }

  generatePdfContent(contractData: any, enhancedTerms: string): string {
    // Generate PDF content based on form data and enhanced terms
    // This is a simplified version, you'd want to expand this
    return `
      Contract between ${contractData.pmcName} and ${contractData.ownerName}
      Property Address: ${contractData.propertyAddress}
      Services: ${this.getSelectedServices(contractData.selectedServices)}
      
      Terms:
      ${enhancedTerms}
      
      Financial Summary:
      (Add financial details here)
    `;
  }

  generatePdf(content: string) {
    const doc = new jsPDF();
    doc.text(content, 10, 10);
    doc.save('contract.pdf');
  }

  getSelectedServices(selectedServices: boolean[]): string {
    return this.services.filter((_, index) => selectedServices[index]).join(', ');
  }

  saveContractToDatabase(contractData: any, enhancedTerms: string) {
    this.contractService.saveContract({ ...contractData, enhancedTerms })
      .subscribe(
        response => console.log('Contract saved successfully', response),
        error => console.error('Error saving contract', error)
      );
  }
}