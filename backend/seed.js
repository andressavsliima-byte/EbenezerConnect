import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ebenezer-connect');
    console.log('✓ Conectado ao MongoDB');

    // Limpar dados existentes
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('✓ Dados antigos removidos');

    // Criar admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@ebenezer.com',
      password: adminPassword,
      company: 'Ebenezer',
      phone: '11999999999',
      role: 'admin',
      isActive: true
    });
    console.log('✓ Admin criado: admin@ebenezer.com (senha: admin123)');

    // Criar parceiro teste
    const partnerPassword = await bcrypt.hash('partner123', 10);
    const partner = await User.create({
      name: 'Empresa Parceira',
      email: 'parceiro@empresa.com',
      password: partnerPassword,
      company: 'Empresa XYZ Ltda',
      phone: '11988888888',
      role: 'partner',
      isActive: true
    });
    console.log('✓ Parceiro criado: parceiro@empresa.com (senha: partner123)');

    // Criar produtos de exemplo SEM imagens (você pode adicionar suas próprias)
    const products = [
      {
        name: 'Motor Elétrico 1HP',
        description: 'Motor elétrico de alta performance para máquinas industriais',
        brand: 'WEG',
        price: 450.00,
        stock: 25,
        category: 'Motores',
        sku: 'MOT-001',
        images: [],
        specifications: {
          'Potência': '1 HP',
          'Voltagem': '220V',
          'Frequência': '60Hz'
        }
      },
      {
        name: 'Corrente de Transmissão',
        description: 'Corrente industrial resistente para transmissão de potência',
        brand: 'REXNORD',
        price: 120.00,
        stock: 50,
        category: 'Correntes',
        sku: 'COR-001',
        images: [],
        specifications: {
          'Tipo': '60H',
          'Comprimento': '10 metros'
        }
      },
      {
        name: 'Rolamento de Esferas',
        description: 'Rolamento de precisão para máquinas de rotação',
        brand: 'SKF',
        price: 85.50,
        stock: 100,
        category: 'Rolamentos',
        sku: 'ROL-001',
        images: [],
        specifications: {
          'Tamanho': '6205',
          'Vedação': 'Dupla'
        }
      },
      {
        name: 'Polia V',
        description: 'Polia em V para sistemas de transmissão',
        brand: 'FENNER',
        price: 95.00,
        stock: 40,
        category: 'Polias',
        sku: 'POL-001',
        images: [],
        specifications: {
          'Diâmetro': '200mm',
          'Largura': '65mm'
        }
      },
      {
        name: 'Acoplamento Elástico',
        description: 'Acoplamento para amortecer vibrações e choques',
        brand: 'LOVEJOY',
        price: 210.00,
        stock: 20,
        category: 'Acoplamentos',
        sku: 'ACO-001',
        images: [],
        specifications: {
          'Torque': '50 Nm',
          'Tipo': 'Flexível'
        }
      },
      {
        name: 'Correia Plana',
        description: 'Correia plana para transmissão de baixa velocidade',
        brand: 'GATES',
        price: 65.00,
        stock: 75,
        category: 'Correias',
        sku: 'CRF-001',
        images: [],
        specifications: {
          'Largura': '50mm',
          'Comprimento': '5 metros'
        }
      }
    ];

    await Product.insertMany(products);
    console.log(`✓ ${products.length} produtos criados`);

    console.log('\n✅ Base de dados populada com sucesso!\n');
    console.log('Credenciais de teste:');
    console.log('═══════════════════════════════════════');
    console.log('Admin:');
    console.log('  Email: admin@ebenezer.com');
    console.log('  Senha: admin123');
    console.log('');
    console.log('Parceiro:');
    console.log('  Email: parceiro@empresa.com');
    console.log('  Senha: partner123');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular base de dados:', error.message);
    process.exit(1);
  }
};

seedDatabase();
