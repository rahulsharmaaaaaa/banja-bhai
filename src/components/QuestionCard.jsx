import React from 'react';
import { CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const QuestionCard = ({ question }) => {
  const { question_statement, options, question_type, is_wrong, check_error } = question;

  const statusIcon = () => {
    if (check_error) {
      return <ExclamationCircleIcon className="h-6 w-6 text-error" />;
    }
    if (is_wrong === null || is_wrong === undefined) {
      return <QuestionMarkCircleIcon className="h-6 w-6 text-textSecondary" />;
    }
    return is_wrong ? (
      <XCircleIcon className="h-6 w-6 text-error" />
    ) : (
      <CheckCircleIcon className="h-6 w-6 text-success" />
    );
  };

  const statusText = () => {
    if (check_error) {
      return <span className="text-error font-medium">Check Error</span>;
    }
    if (is_wrong === null || is_wrong === undefined) {
      return <span className="text-textSecondary font-medium">Not Checked</span>;
    }
    return is_wrong ? (
      <span className="text-error font-medium">Wrong</span>
    ) : (
      <span className="text-success font-medium">Correct</span>
    );
  };

  const cardBorderClass = () => {
    if (check_error) return 'border-error shadow-md shadow-error/30';
    if (is_wrong === null || is_wrong === undefined) return 'border-border';
    return is_wrong ? 'border-error shadow-md shadow-error/30' : 'border-success shadow-md shadow-success/30';
  };

  return (
    <div
      className={`
        bg-surface p-6 rounded-xl border-2 transition-all duration-300 ease-in-out
        hover:scale-[1.02] hover:shadow-lg
        ${cardBorderClass()}
        animate-fade-in-up
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">{question_type}</span>
        <div className="flex items-center gap-2">
          {statusIcon()}
          {statusText()}
        </div>
      </div>
      <p className="text-text text-lg font-medium mb-4 leading-relaxed">
        {question_statement}
      </p>

      {options && options.length > 0 && (
        <div className="mb-4">
          <h4 className="text-textSecondary text-sm mb-2">Options:</h4>
          <ul className="list-disc list-inside text-textSecondary text-sm space-y-1">
            {options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
      )}

      {check_error && (
        <p className="text-error text-sm mt-2">
          An error occurred during AI check. Please see console for details.
        </p>
      )}
    </div>
  );
};

export default QuestionCard;
