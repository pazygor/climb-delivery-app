import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ProdutoService } from '../../../../../core/services/produto.service';
import { CategoriaService } from '../../../../../core/services/categoria.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Produto, CreateProdutoDto, UpdateProdutoDto } from '../../../../../core/models/produto.model';
import { Categoria } from '../../../../../core/models/categoria.model';

@Component({
  selector: 'app-modal-produto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FileUploadModule,
    DropdownModule
  ],
  templateUrl: './modal-produto.component.html',
  styleUrl: './modal-produto.component.scss'
})
export class ModalProdutoComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() produto?: Produto;
  @Input() categoriaId?: number;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() salvou = new EventEmitter<Produto>();

  nome: string = '';
  descricao: string = '';
  categoriaIdSelecionada?: number;
  preco: number = 0;
  tempoPreparo?: number;
  imagemFile?: File;
  imagemPreview?: string;
  loading: boolean = false;
  empresaId: number | null = null;

  categorias: Categoria[] = [];

  constructor(
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    this.carregarCategorias();
    if (this.produto) {
      this.carregarDados();
    } else if (this.categoriaId) {
      this.categoriaIdSelecionada = this.categoriaId;
    }
  }

  ngOnChanges(): void {
    if (this.visible) {
      if (this.produto) {
        this.carregarDados();
      } else {
        this.limparFormulario();
        if (this.categoriaId) {
          this.categoriaIdSelecionada = this.categoriaId;
        }
      }
    }
  }

  carregarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias.filter((c: Categoria) => c.ativo);
      },
      error: (error: any) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  carregarDados(): void {
    if (this.produto) {
      this.nome = this.produto.nome;
      this.descricao = this.produto.descricao || '';
      this.categoriaIdSelecionada = this.produto.categoriaId;
      this.preco = this.produto.preco;
      this.tempoPreparo = this.produto.tempoPreparo || undefined;
      this.imagemPreview = this.produto.imagem || undefined;
    }
  }

  limparFormulario(): void {
    this.nome = '';
    this.descricao = '';
    this.categoriaIdSelecionada = this.categoriaId;
    this.preco = 0;
    this.tempoPreparo = undefined;
    this.imagemFile = undefined;
    this.imagemPreview = undefined;
  }

  onImagemSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      // Validar tamanho (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Atenção',
          detail: 'A imagem deve ter no máximo 2MB'
        });
        return;
      }

      this.imagemFile = file;

      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagemPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removerImagem(): void {
    this.imagemFile = undefined;
    this.imagemPreview = undefined;
  }

  fechar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.limparFormulario();
  }

  salvar(): void {
    if (!this.nome.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O nome do produto é obrigatório'
      });
      return;
    }

    if (!this.categoriaIdSelecionada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione uma categoria'
      });
      return;
    }

    if (this.preco <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O preço deve ser maior que zero'
      });
      return;
    }

    this.loading = true;

    if (this.produto) {
      this.atualizarProduto();
    } else {
      this.criarProduto();
    }
  }

  criarProduto(): void {
    if (!this.empresaId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Empresa não identificada'
      });
      this.loading = false;
      return;
    }

    // Garantir que preco seja um número válido
    const precoString = String(this.preco).replace(',', '.');
    const precoNumero = parseFloat(precoString);

    console.log('Valor do preco original:', this.preco);
    console.log('Valor do preco convertido:', precoNumero);
    console.log('Tipo do preco:', typeof precoNumero);

    if (isNaN(precoNumero) || precoNumero <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O preço deve ser um número válido maior que zero'
      });
      this.loading = false;
      return;
    }

    // Formatar preço como string decimal com 2 casas decimais
    const precoFormatado = precoNumero.toFixed(2);

    const dto: CreateProdutoDto = {
      empresaId: this.empresaId,
      nome: this.nome.trim(),
      descricao: this.descricao.trim() || undefined,
      categoriaId: this.categoriaIdSelecionada!,
      preco: precoFormatado as any,
      tempoPreparo: this.tempoPreparo ? Number(this.tempoPreparo) : undefined,
      disponivel: true,
      ordem: 0
    };

    console.log('DTO enviado:', JSON.stringify(dto, null, 2));

    this.produtoService.create(dto).subscribe({
      next: (novoProduto: Produto) => {
        // Se tem imagem, fazer upload
        if (this.imagemFile) {
          this.uploadImagem(novoProduto.id, novoProduto);
        } else {
          this.finalizarSalvar(novoProduto);
        }
      },
      error: (error: any) => {
        console.error('Erro ao criar produto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao criar produto'
        });
        this.loading = false;
      }
    });
  }

  atualizarProduto(): void {
    // Garantir que preco seja um número válido
    const precoString = String(this.preco).replace(',', '.');
    const precoNumero = parseFloat(precoString);

    // Formatar preço como string decimal com 2 casas decimais
    const precoFormatado = precoNumero.toFixed(2);

    const dto: UpdateProdutoDto = {
      nome: this.nome.trim(),
      descricao: this.descricao.trim() || undefined,
      categoriaId: this.categoriaIdSelecionada!,
      preco: precoFormatado as any,
      tempoPreparo: this.tempoPreparo ? Number(this.tempoPreparo) : undefined
    };

    this.produtoService.update(this.produto!.id, dto).subscribe({
      next: (produtoAtualizado: Produto) => {
        // Se tem imagem nova, fazer upload
        if (this.imagemFile) {
          this.uploadImagem(produtoAtualizado.id, produtoAtualizado);
        } else {
          this.finalizarSalvar(produtoAtualizado);
        }
      },
      error: (error: any) => {
        console.error('Erro ao atualizar produto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar produto'
        });
        this.loading = false;
      }
    });
  }

  uploadImagem(produtoId: number, produto: Produto): void {
    if (!this.imagemFile) {
      this.finalizarSalvar(produto);
      return;
    }

    this.produtoService.uploadImagem(produtoId, this.imagemFile).subscribe({
      next: (response: { url: string }) => {
        // Atualiza produto com URL da imagem
        produto.imagem = response.url;
        this.finalizarSalvar(produto);
      },
      error: (error: any) => {
        console.error('Erro ao fazer upload da imagem:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Aviso',
          detail: 'Produto salvo, mas houve erro no upload da imagem'
        });
        this.finalizarSalvar(produto);
      }
    });
  }

  finalizarSalvar(produto: Produto): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: this.produto ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso'
    });
    this.salvou.emit(produto);
    this.fechar();
    this.loading = false;
  }

  get tituloModal(): string {
    return this.produto ? 'Editar Item' : 'Novo Item';
  }
}
