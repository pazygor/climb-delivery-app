import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfiguracaoLinkPublicoService } from '../../../../core/services/configuracao-link-publico.service';
import { AuthService } from '../../../../core/services/auth.service';
import { 
  ConfiguracaoLinkPublico, 
  EstiloBotao, 
  EstiloCard, 
  TamanhoFonte 
} from '../../../../core/models/configuracao-link-publico.model';

@Component({
  selector: 'app-link-public',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    InputSwitchModule,
    DropdownModule,
    ToastModule,
    ColorPickerModule,
    FileUploadModule
  ],
  providers: [MessageService],
  templateUrl: './link-public.component.html',
  styleUrl: './link-public.component.scss'
})
export class LinkPublicComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  empresaId: number | null = null;
  publicUrl = '';
  empresaSlug: string | null = null;

  // Previews de imagens
  bannerDesktopPreview: string | null = null;
  bannerMobilePreview: string | null = null;
  logoHeaderPreview: string | null = null;
  logoPrincipalPreview: string | null = null;
  faviconPreview: string | null = null;

  estilosBotao = [
    { label: 'Quadrado', value: EstiloBotao.SQUARE },
    { label: 'Arredondado', value: EstiloBotao.ROUNDED },
    { label: 'Pill', value: EstiloBotao.PILL }
  ];

  estilosCard = [
    { label: 'Flat', value: EstiloCard.FLAT },
    { label: 'Borda', value: EstiloCard.BORDER },
    { label: 'Sombra', value: EstiloCard.SHADOW }
  ];

  tamanhosFonte = [
    { label: 'Pequeno', value: TamanhoFonte.SMALL },
    { label: 'Médio', value: TamanhoFonte.MEDIUM },
    { label: 'Grande', value: TamanhoFonte.LARGE }
  ];

  constructor(
    private fb: FormBuilder,
    private configuracaoService: ConfiguracaoLinkPublicoService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    
    if (!this.empresaId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível identificar o restaurante do usuário logado'
      });
      return;
    }

    this.initForm();
    this.loadConfiguracao();
  }

  initForm(): void {
    this.form = this.fb.group({
      // Banners
      exibirBanner: [true],
      mensagemBanner: [''],
      urlBannerDesktop: [''],
      urlBannerMobile: [''],

      // Logos
      urlLogoHeader: [''],
      urlLogoPrincipal: [''],
      urlFavicon: [''],

      // Cores (formato #RRGGBB)
      corPrimaria: ['#E63946', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
      corSecundaria: ['#C2263B', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
      corAcento: ['#FF5964', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
      corTexto: ['#212121', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
      corFundo: ['#FFFFFF', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
      corHeaderBackground: ['#E63946', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],
      corHeaderTexto: ['#FFFFFF', [Validators.required, Validators.pattern(/^#[0-9A-F]{6}$/i)]],

      // Estilos
      estiloBotao: [EstiloBotao.ROUNDED, Validators.required],
      estiloCard: [EstiloCard.SHADOW, Validators.required],
      tamanhoFonte: [TamanhoFonte.MEDIUM, Validators.required],

      // Exibição
      exibirPromocoes: [true],
      exibirDestaques: [true],

      // SEO
      metaTitulo: ['', [Validators.maxLength(60)]],
      metaDescricao: ['', [Validators.maxLength(160)]],

      // Redes Sociais
      urlInstagram: ['', Validators.pattern(/^https?:\/\/.+/)],
      urlFacebook: ['', Validators.pattern(/^https?:\/\/.+/)],
      urlWhatsapp: ['', Validators.pattern(/^\+?\d{10,15}$/)]
    });
  }

  loadConfiguracao(): void {
    if (!this.empresaId) return;

    this.loading = true;
    this.configuracaoService.getByEmpresaId(this.empresaId).subscribe({
      next: (config) => {
        if (config) {
          this.form.patchValue(config);
          
          // Popular previews das imagens
          if (config.urlBannerDesktop) {
            this.bannerDesktopPreview = config.urlBannerDesktop;
          }
          if (config.urlBannerMobile) {
            this.bannerMobilePreview = config.urlBannerMobile;
          }
          if (config.urlLogoHeader) {
            this.logoHeaderPreview = config.urlLogoHeader;
          }
          if (config.urlLogoPrincipal) {
            this.logoPrincipalPreview = config.urlLogoPrincipal;
          }
          if (config.urlFavicon) {
            this.faviconPreview = config.urlFavicon;
          }
          
          // Buscar slug da empresa (poderia vir do AuthService também)
          // Por enquanto, vamos simular o slug baseado no empresaId
          this.empresaSlug = `empresa-${this.empresaId}`;
          this.updatePublicUrl();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar configuração:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar configurações'
        });
        this.loading = false;
      }
    });
  }

  updatePublicUrl(): void {
    if (this.empresaSlug) {
      this.publicUrl = this.configuracaoService.getPublicUrl(this.empresaSlug);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.empresaId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios corretamente'
      });
      return;
    }

    this.loading = true;
    const formData: Partial<ConfiguracaoLinkPublico> = this.form.value;

    // Chama update que cria se não existir
    this.configuracaoService.update(this.empresaId, formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Configurações salvas com sucesso!'
        });
        this.loading = false;
        this.updatePublicUrl();
        this.loadConfiguracao(); // Recarrega para pegar o ID
      },
      error: (error) => {
        console.error('Erro ao salvar configuração:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Erro ao salvar configurações'
        });
        this.loading = false;
      }
    });
  }

  onReset(): void {
    this.form.reset();
    this.loadConfiguracao();
  }

  copyPublicUrl(): void {
    if (this.publicUrl) {
      navigator.clipboard.writeText(this.publicUrl);
      this.messageService.add({
        severity: 'success',
        summary: 'Copiado!',
        detail: 'Link público copiado para a área de transferência'
      });
    }
  }

  openPublicUrl(): void {
    if (this.publicUrl) {
      window.open(this.publicUrl, '_blank');
    }
  }

  // Métodos de Upload de Imagens
  onBannerDesktopSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.bannerDesktopPreview = e.target.result;
        this.form.patchValue({ urlBannerDesktop: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  removeBannerDesktop(): void {
    this.bannerDesktopPreview = null;
    this.form.patchValue({ urlBannerDesktop: null });
  }

  onBannerMobileSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.bannerMobilePreview = e.target.result;
        this.form.patchValue({ urlBannerMobile: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  removeBannerMobile(): void {
    this.bannerMobilePreview = null;
    this.form.patchValue({ urlBannerMobile: null });
  }

  onLogoHeaderSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoHeaderPreview = e.target.result;
        this.form.patchValue({ urlLogoHeader: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogoHeader(): void {
    this.logoHeaderPreview = null;
    this.form.patchValue({ urlLogoHeader: null });
  }

  onLogoPrincipalSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPrincipalPreview = e.target.result;
        this.form.patchValue({ urlLogoPrincipal: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogoPrincipal(): void {
    this.logoPrincipalPreview = null;
    this.form.patchValue({ urlLogoPrincipal: null });
  }

  onFaviconSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.faviconPreview = e.target.result;
        this.form.patchValue({ urlFavicon: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  removeFavicon(): void {
    this.faviconPreview = null;
    this.form.patchValue({ urlFavicon: null });
  }
}
