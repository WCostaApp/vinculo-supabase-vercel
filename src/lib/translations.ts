export type Language = 'pt' | 'en' | 'es';

export const translations = {
  pt: {
    // Auth
    login: 'Entrar',
    register: 'Cadastrar',
    email: 'E-mail',
    cpf: 'CPF',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    forgotPassword: 'Esqueceu a senha?',
    dontHaveAccount: 'Não tem uma conta?',
    alreadyHaveAccount: 'Já tem uma conta?',
    
    // Plans
    basicModel: 'Basic Model',
    fashionModel: 'Fashion Model',
    superModel: 'Super Model',
    imagesPerMonth: 'imagens/mês',
    subscribe: 'Assinar',
    currentPlan: 'Plano Atual',
    
    // Dashboard
    dashboard: 'Painel',
    generateImage: 'Gerar Imagem',
    myPhotos: 'Minhas Fotos',
    gallery: 'Galeria',
    settings: 'Configurações',
    logout: 'Sair',
    imagesRemaining: 'Imagens Restantes',
    
    // Image Generation
    uploadClothing: 'Carregar Roupa',
    clothingType: 'Tipo de Roupa',
    superior: 'Superior',
    inferior: 'Inferior',
    conjunto: 'Conjunto/Vestido',
    description: 'Descrição',
    generate: 'Gerar',
    
    // Terms
    termsTitle: 'Termos de Uso',
    termsAccept: 'Li e aceito os Termos de Uso e entendo que minhas fotos serão deletadas após o processamento.',
    termsCheckboxLabel: 'Li e aceito os Termos de Uso',
    viewTerms: 'Ver Termos',
    
    // Terms Content
    termsIntro: 'Ao utilizar o Fashion.ai, você concorda com os seguintes termos:',
    
    term1Title: '1. Uso de Inteligência Artificial',
    term1: 'Os resultados gerados pelo Fashion.ai são produzidos por Inteligência Artificial e podem apresentar variações ou imperfeições em relação à realidade. O aplicativo não se compromete a representar a realidade de forma exata.',
    
    term2Title: '2. Responsabilidade do Usuário',
    term2: 'O usuário é o único responsável pelas imagens que envia. É estritamente proibido enviar fotos de terceiros sem autorização expressa. Também é proibido enviar fotos contendo nudez, conteúdo ilegal ou que violem direitos de terceiros. O uso é estritamente para diversão e fins pessoais.',
    
    term3Title: '3. Cancelamento da Assinatura',
    term3: 'Os planos de assinatura serão renovados automaticamente no cartão de crédito cadastrado. O usuário pode cancelar a renovação automática a qualquer momento diretamente na plataforma de pagamento utilizada (Stripe, PayPal, etc.). O cancelamento impedirá cobranças futuras, mas não gerará reembolso do período já pago.',
    
    term4Title: '4. Uso de APIs de Terceiros',
    term4: 'Os dados (fotos) enviados pelos usuários são processados em servidores de parceiros tecnológicos (Fal.ai) que seguem padrões rigorosos de segurança e privacidade. Suas fotos serão automaticamente deletadas após o processamento e geração das imagens.',
    
    term5Title: '5. Privacidade e Segurança',
    term5: 'Todas as fotos enviadas são tratadas com confidencialidade e serão permanentemente deletadas após o processamento. O administrador do aplicativo terá acesso a dados de hierarquia de contas para garantir segurança e evitar abusos, mas não terá acesso às suas fotos após o processamento.',
    
    term6Title: '6. Aceitação dos Termos',
    term6: 'Ao marcar a caixa de aceitação e criar sua conta, você declara ter lido, compreendido e concordado com todos os termos aqui descritos.',
    
    // Referral
    referralCode: 'Código de Indicação',
    shareCode: 'Compartilhar Código',
    bonusCredits: 'Créditos Bônus',
    
    // Messages
    uploadSuccess: 'Upload realizado com sucesso!',
    generateSuccess: 'Imagem gerada com sucesso!',
    error: 'Erro',
    success: 'Sucesso',
    termsNotAccepted: 'Você deve aceitar os Termos de Uso para continuar',
  },
  en: {
    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    cpf: 'CPF',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    
    // Plans
    basicModel: 'Basic Model',
    fashionModel: 'Fashion Model',
    superModel: 'Super Model',
    imagesPerMonth: 'images/month',
    subscribe: 'Subscribe',
    currentPlan: 'Current Plan',
    
    // Dashboard
    dashboard: 'Dashboard',
    generateImage: 'Generate Image',
    myPhotos: 'My Photos',
    gallery: 'Gallery',
    settings: 'Settings',
    logout: 'Logout',
    imagesRemaining: 'Images Remaining',
    
    // Image Generation
    uploadClothing: 'Upload Clothing',
    clothingType: 'Clothing Type',
    superior: 'Top',
    inferior: 'Bottom',
    conjunto: 'Outfit/Dress',
    description: 'Description',
    generate: 'Generate',
    
    // Terms
    termsTitle: 'Terms of Use',
    termsAccept: 'I have read and accept the Terms of Use and understand that my photos will be deleted after processing.',
    termsCheckboxLabel: 'I have read and accept the Terms of Use',
    viewTerms: 'View Terms',
    
    // Terms Content
    termsIntro: 'By using Fashion.ai, you agree to the following terms:',
    
    term1Title: '1. Use of Artificial Intelligence',
    term1: 'Results generated by Fashion.ai are produced by Artificial Intelligence and may present variations or imperfections compared to reality. The app does not commit to represent reality exactly.',
    
    term2Title: '2. User Responsibility',
    term2: 'The user is solely responsible for the images they upload. It is strictly prohibited to upload photos of third parties without express authorization. It is also prohibited to upload photos containing nudity, illegal content, or that violate third-party rights. Use is strictly for fun and personal purposes.',
    
    term3Title: '3. Subscription Cancellation',
    term3: 'Subscription plans will be automatically renewed on the registered credit card. Users can cancel automatic renewal at any time directly on the payment platform used (Stripe, PayPal, etc.). Cancellation will prevent future charges but will not generate a refund for the period already paid.',
    
    term4Title: '4. Use of Third-Party APIs',
    term4: 'Data (photos) uploaded by users are processed on servers of technology partners (Fal.ai) that follow strict security and privacy standards. Your photos will be automatically deleted after processing and image generation.',
    
    term5Title: '5. Privacy and Security',
    term5: 'All uploaded photos are treated confidentially and will be permanently deleted after processing. The app administrator will have access to account hierarchy data to ensure security and prevent abuse, but will not have access to your photos after processing.',
    
    term6Title: '6. Acceptance of Terms',
    term6: 'By checking the acceptance box and creating your account, you declare that you have read, understood, and agreed to all the terms described here.',
    
    // Referral
    referralCode: 'Referral Code',
    shareCode: 'Share Code',
    bonusCredits: 'Bonus Credits',
    
    // Messages
    uploadSuccess: 'Upload successful!',
    generateSuccess: 'Image generated successfully!',
    error: 'Error',
    success: 'Success',
    termsNotAccepted: 'You must accept the Terms of Use to continue',
  },
  es: {
    // Auth
    login: 'Iniciar sesión',
    register: 'Registrarse',
    email: 'Correo electrónico',
    cpf: 'CPF',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    dontHaveAccount: '¿No tienes una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    
    // Plans
    basicModel: 'Basic Model',
    fashionModel: 'Fashion Model',
    superModel: 'Super Model',
    imagesPerMonth: 'imágenes/mes',
    subscribe: 'Suscribirse',
    currentPlan: 'Plan Actual',
    
    // Dashboard
    dashboard: 'Panel',
    generateImage: 'Generar Imagen',
    myPhotos: 'Mis Fotos',
    gallery: 'Galería',
    settings: 'Configuración',
    logout: 'Salir',
    imagesRemaining: 'Imágenes Restantes',
    
    // Image Generation
    uploadClothing: 'Cargar Ropa',
    clothingType: 'Tipo de Ropa',
    superior: 'Superior',
    inferior: 'Inferior',
    conjunto: 'Conjunto/Vestido',
    description: 'Descripción',
    generate: 'Generar',
    
    // Terms
    termsTitle: 'Términos de Uso',
    termsAccept: 'He leído y acepto los Términos de Uso y entiendo que mis fotos serán eliminadas después del procesamiento.',
    termsCheckboxLabel: 'He leído y acepto los Términos de Uso',
    viewTerms: 'Ver Términos',
    
    // Terms Content
    termsIntro: 'Al utilizar Fashion.ai, aceptas los siguientes términos:',
    
    term1Title: '1. Uso de Inteligencia Artificial',
    term1: 'Los resultados generados por Fashion.ai son producidos por Inteligencia Artificial y pueden presentar variaciones o imperfecciones en relación con la realidad. La aplicación no se compromete a representar la realidad de forma exacta.',
    
    term2Title: '2. Responsabilidad del Usuario',
    term2: 'El usuario es el único responsable de las imágenes que envía. Está estrictamente prohibido enviar fotos de terceros sin autorización expresa. También está prohibido enviar fotos que contengan desnudez, contenido ilegal o que violen derechos de terceros. El uso es estrictamente para diversión y fines personales.',
    
    term3Title: '3. Cancelación de la Suscripción',
    term3: 'Los planes de suscripción se renovarán automáticamente en la tarjeta de crédito registrada. El usuario puede cancelar la renovación automática en cualquier momento directamente en la plataforma de pago utilizada (Stripe, PayPal, etc.). La cancelación impedirá cargos futuros, pero no generará un reembolso del período ya pagado.',
    
    term4Title: '4. Uso de APIs de Terceros',
    term4: 'Los datos (fotos) enviados por los usuarios se procesan en servidores de socios tecnológicos (Fal.ai) que siguen estándares rigurosos de seguridad y privacidad. Tus fotos serán eliminadas automáticamente después del procesamiento y generación de imágenes.',
    
    term5Title: '5. Privacidad y Seguridad',
    term5: 'Todas las fotos enviadas se tratan con confidencialidad y serán eliminadas permanentemente después del procesamiento. El administrador de la aplicación tendrá acceso a datos de jerarquía de cuentas para garantizar la seguridad y evitar abusos, pero no tendrá acceso a tus fotos después del procesamiento.',
    
    term6Title: '6. Aceptación de los Términos',
    term6: 'Al marcar la casilla de aceptación y crear tu cuenta, declaras haber leído, comprendido y aceptado todos los términos aquí descritos.',
    
    // Referral
    referralCode: 'Código de Referencia',
    shareCode: 'Compartir Código',
    bonusCredits: 'Créditos Bonus',
    
    // Messages
    uploadSuccess: '¡Carga exitosa!',
    generateSuccess: '¡Imagen generada con éxito!',
    error: 'Error',
    success: 'Éxito',
    termsNotAccepted: 'Debes aceptar los Términos de Uso para continuar',
  },
};
