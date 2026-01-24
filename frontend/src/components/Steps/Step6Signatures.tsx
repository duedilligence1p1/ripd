import { ProjectFormData } from '@/app/project/[id]/page';

interface Step6SignaturesProps {
    formData: ProjectFormData;
    updateFormData: (data: Partial<ProjectFormData>) => void;
}

export default function Step6Signatures({ formData, updateFormData }: Step6SignaturesProps) {
    return (
        <div className="space-y-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Aprovações e Assinaturas
                </h3>
                <p className="text-blue-700 text-sm">
                    Esta é a etapa final de formalização do RIPD. Os responsáveis devem declarar ciência e aprovação do conteúdo deste relatório.
                </p>
            </div>

            {/* 1. Responsável pela Elaboração */}
            <div className="space-y-4">
                <h4 className="text-md font-bold text-gray-800 border-b pb-2">
                    1. Responsável pela Elaboração
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            value={formData.preparerName || ''}
                            onChange={(e) => updateFormData({ preparerName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Nome do elaborador"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cargo / Função *
                        </label>
                        <input
                            type="text"
                            value={formData.preparerRole || ''}
                            onChange={(e) => updateFormData({ preparerRole: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Ex: Analista de Privacidade"
                        />
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        id="check_preparer"
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="check_preparer" className="text-sm text-gray-600">
                        Declaro que as informações inseridas neste relatório são verdadeiras e refletem fielmente o processo de tratamento de dados analisado.
                    </label>
                </div>
            </div>

            {/* 2. Gestor da Área de Negócio */}
            <div className="space-y-4">
                <h4 className="text-md font-bold text-gray-800 border-b pb-2">
                    2. Gestor da Área de Negócio
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            value={formData.managerName || ''}
                            onChange={(e) => updateFormData({ managerName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Nome do gestor da área"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cargo / Função *
                        </label>
                        <input
                            type="text"
                            value={formData.managerRole || ''}
                            onChange={(e) => updateFormData({ managerRole: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Ex: Gerente de Marketing"
                        />
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        id="check_manager"
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="check_manager" className="text-sm text-gray-600">
                        Estou ciente dos riscos apontados neste relatório e aprovo o Plano de Ação proposto para mitigação.
                    </label>
                </div>
            </div>

            {/* 3. DPO */}
            <div className="space-y-4">
                <h4 className="text-md font-bold text-gray-800 border-b pb-2">
                    3. Encarregado (DPO)
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do DPO
                        </label>
                        <input
                            type="text"
                            value={formData.dpoName || ''}
                            disabled
                            className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Preenchido na etapa 1</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        id="check_dpo"
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="check_dpo" className="text-sm text-gray-600">
                        Validei a metodologia aplicada e as conclusões deste Relatório de Impacto à Proteção de Dados.
                    </label>
                </div>
            </div>
        </div>
    );
}
