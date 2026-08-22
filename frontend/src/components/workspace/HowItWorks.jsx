import React from 'react';

const HowItWorks = ({ etapes, conseil }) => {
  return (
    <section className="how-it-works mt-12 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Comment utiliser cet outil ?
      </h2>

      <div className="steps">
        {etapes.map((etape, index) => (
          <div key={index} className="step flex gap-4 mb-5">
            <div className="step-number w-8 h-8 rounded-full bg-blue-100
                            text-blue-600 flex items-center justify-center
                            font-semibold text-sm flex-shrink-0">
              {index + 1}
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">{etape.titre}</h3>
              <p className="text-sm text-gray-500">{etape.description}</p>
            </div>
          </div>
        ))}
      </div>

      {conseil && (
        <div className="conseil mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">💡 Conseil : </span>
            {conseil}
          </p>
        </div>
      )}
    </section>
  );
};

export default HowItWorks;
