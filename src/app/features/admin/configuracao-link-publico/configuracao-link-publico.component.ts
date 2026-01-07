import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfiguracaoLinkPublicoService } from '../../../core/services/configuracao-link-publico.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { ConfiguracaoLinkPublico } from '../../../core/models/configuracao-link-publico.model';

@Component({
  selector: 'app-configuracao-link-publico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracao-link-publico.component.html',
  styleUrl: './configuracao-link-publico.component.scss'
})
export class ConfiguracaoLinkPublicoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configuracaoService = inject(ConfiguracaoLinkPublicoService);
  private empresaService = inject(EmpresaService);

  form!: FormGroup;
  configuracao: ConfiguracaoLinkPublico | null = null;
  empresaId = 1; // TODO: Pegar do contexto do usuário logado
  slug = ''; // TODO: Pegar do contexto da empresa
  loading = false;
  saving = false;
  publicUrl = '';

  ngOnInit(): void {
    this.initForm();
    this.loadConfiguracao();
  }

  private initForm(): void {
    this.form = this.fb.group({
      // Banner
      bannerUrl: [''],
      bannerMobileUrl: [''],
      exibirBanner: [true],
      mensagemBanner: [''],
      
      // Cores
      corPrimaria: ['#cc0000', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      corSecundaria: ['#ffa000', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      corAcento: ['#00bfa5', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      corTexto: ['#212121', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      corFundo: ['#ffffff', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      corHeaderBackground: ['#cc0000', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      corHeaderTexto: ['#ffffff', [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      
      // Logos
      logoUrl: [''],
      faviconUrl: [''],
      logoHeaderUrl: [''],
      
      // Estilo
      estiloBotao: ['rounded'],
      estiloCard: ['shadow'],
      tamanhoFonte: ['medium'],
      
      // Exibição
      exibirPromocoes: [true],
      exibirDestaques: [true],
      
      // SEO
      metaTitulo: [''],
      metaDescricao: [''],
      metaKeywords: [''],
      
      // Redes Sociais
      urlFacebook: [''],
      urlInstagram: [''],
      urlTwitter: ['']
    });
  }

  private loadConfiguracao(): void {
    this.loading = true;
    this.configuracaoService.getByEmpresaId(this.empresaId).subscribe({
      next: (config) => {
        this.configuracao = config;
        this.form.patchValue(config);
        this.publicUrl = this.configuracaoService.getPublicUrl(this.slug);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar configuração:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formData = this.form.value;

    const request$ = this.configuracao?.id
      ? this.configuracaoService.update(this.configuracao.id, formData)
      : this.configuracaoService.create({ ...formData, empresaId: this.empresaId });

    request$.subscribe({
      next: (config) => {
        this.configuracao = config;
        this.saving = false;
        alert('Configurações salvas com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao salvar configuração:', error);
        this.saving = false;
        alert('Erro ao salvar configurações. Tente novamente.');
      }
    });
  }

  copiarLinkPublico(): void {
    navigator.clipboard.writeText(this.publicUrl).then(() => {
      alert('Link copiado para a área de transferência!');
    });
  }

  abrirPreview(): void {
    window.open(this.publicUrl, '_blank');
  }

  resetarCores(): void {
    this.form.patchValue({
      corPrimaria: '#cc0000',
      corSecundaria: '#ffa000',
      corAcento: '#00bfa5',
      corTexto: '#212121',
      corFundo: '#ffffff',
      corHeaderBackground: '#cc0000',
      corHeaderTexto: '#ffffff'
    });
  }
}
