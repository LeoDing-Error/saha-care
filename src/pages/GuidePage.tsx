import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Activity, Bug, Siren, Wind, Info } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const protocolSteps = [
  {
    number: '01',
    title: 'Identify',
    description: 'Cross-check patient symptoms with the case definitions below.',
  },
  {
    number: '02',
    title: 'Stabilize',
    description: 'Administer immediate first-line aid (e.g., ORS) where applicable.',
  },
  {
    number: '03',
    title: 'Digitize',
    description: 'Use the REPORT CASE button to sync data with central health HQ.',
  },
  {
    number: '04',
    title: 'Follow Up',
    description: 'Ensure the patient reaches a professional medical facility.',
  },
];

const diseases = [
  {
    id: 'cholera',
    name: 'Cholera',
    icon: Droplet,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    badge: { text: 'HIGH PRIORITY', color: 'bg-red-100 text-red-700 border-red-200' },
    definition: 'Severe acute watery diarrhea in a patient aged 2 years or older, with or without vomiting.',
    recommendations: [
      'Immediate isolation',
      'Aggressive ORS therapy',
    ],
  },
  {
    id: 'measles',
    name: 'Measles',
    icon: Activity,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    definition: 'Fever and maculopapular rash with at least one of: cough, coryza, or conjunctivitis.',
    recommendations: [
      'Vitamin A supplementation',
      'Notify local health clinic',
    ],
  },
  {
    id: 'malaria',
    name: 'Malaria',
    icon: Bug,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: { text: 'ENDEMIC', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    definition: 'Fever or history of fever in the last 48 hours. Confirmed by RDT or microscopy.',
    recommendations: [
      'ACT Treatment',
      'Long-lasting insecticidal nets',
    ],
  },
  {
    id: 'awd',
    name: 'Acute Watery Diarrhea',
    icon: Droplet,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    definition: '3 or more loose stools in 24 hours. Monitor for dehydration levels.',
    recommendations: [
      'ORS Administration',
      'Hand hygiene education',
    ],
  },
  {
    id: 'meningitis',
    name: 'Meningitis',
    icon: Siren,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    badge: { text: 'URGENT', color: 'bg-red-100 text-red-700 border-red-200' },
    definition: 'Sudden onset of fever with stiff neck, altered consciousness, or bulging fontanelle.',
    recommendations: [
      'Immediate referral',
      'Antibiotic prophylaxis',
    ],
  },
  {
    id: 'respiratory',
    name: 'Respiratory Infections',
    icon: Wind,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    definition: 'Cough or difficulty breathing with tachypnea (fast breathing) for age.',
    recommendations: [
      'Assess for chest indrawing',
      'Supportive care',
    ],
  },
];

export function GuidePage() {
  const navigate = useNavigate();

  const handleReportCase = (disease: typeof diseases[0]) => {
    navigate('/report/new', { state: { selectedDisease: disease.name } });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-gray-900">Guide</h1>
        <p className="text-sm text-gray-500 mt-1">Reporting Protocol & Disease Surveillance Reference</p>
      </div>

      {/* Reporting Protocol */}
      <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl text-gray-900">Reporting Protocol</h2>
              <p className="text-sm text-gray-600">Standard Operating Procedure for field volunteers</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {protocolSteps.map((step) => (
              <div key={step.number} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-4xl font-light text-gray-300 mb-2">{step.number}</div>
                <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disease Surveillance Guide */}
      <div>
        <h2 className="text-2xl text-gray-900 mb-2">Disease Surveillance Guide</h2>
        <p className="text-gray-600 mb-6">Quick reference and reporting tool for field volunteers.</p>

        <div className="grid grid-cols-3 gap-6">
          {diseases.map((disease) => {
            const Icon = disease.icon;

            return (
              <Card key={disease.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${disease.iconBg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${disease.iconColor}`} />
                    </div>
                    {disease.badge && (
                      <Badge variant="outline" className={`${disease.badge.color} border text-xs px-2 py-0.5`}>
                        {disease.badge.text}
                      </Badge>
                    )}
                  </div>

                  {/* Disease Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{disease.name}</h3>

                  {/* Case Definition */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      Case Definition
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{disease.definition}</p>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {disease.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Report Button */}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleReportCase(disease)}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    REPORT CASE
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
