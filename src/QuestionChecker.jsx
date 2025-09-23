import React, { useState, useEffect } from 'react';
import { supabase } from './api/supabase';
import { checkQuestionWithGemini } from './api/gemini';
import QuestionCard from './components/QuestionCard';
import Button from './components/Button';
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // For refresh icon
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'; // For error icon

const QuestionChecker = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [checkedCount, setCheckedCount] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('new_questions')
        .select('*');

      if (error) throw error;
      // Ensure options are parsed if they come as JSON strings
      const parsedData = data.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }));
      setQuestions(parsedData || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please ensure your Supabase project is configured and the "new_questions" table exists with RLS policies allowing public read access.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAllQuestions = async () => {
    setChecking(true);
    setError(null);
    setCheckedCount(0);
    const updatedQuestions = [...questions];

    for (let i = 0; i < updatedQuestions.length; i++) {
      const question = updatedQuestions[i];
      try {
        const isWrong = await checkQuestionWithGemini(question);
        updatedQuestions[i] = { ...question, is_wrong: isWrong, check_error: false };

        // Update Supabase
        const { error: updateError } = await supabase
          .from('new_questions')
          .update({ is_wrong: isWrong })
          .eq('id', question.id); // Assuming 'id' is the primary key

        if (updateError) throw updateError;

        setQuestions([...updatedQuestions]); // Update state to reflect changes immediately
        setCheckedCount(prev => prev + 1);
      } catch (err) {
        console.error(`Error checking question ${question.id}:`, err);
        // Mark this specific question as having an error
        updatedQuestions[i] = { ...question, is_wrong: true, check_error: true };
        setQuestions([...updatedQuestions]);
        setError(`Failed to check question "${question.question_statement.substring(0, Math.min(question.question_statement.length, 50))}...". See console for details.`);
      }
    }
    setChecking(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-400px)] md:h-[calc(100vh-500px)] text-text text-xl animate-pulse">
        <ArrowPathIcon className="h-12 w-12 text-primary mb-4 animate-spin" />
        Loading questions...
      </div>
    );
  }

  if (error && !checking) {
    return (
      <div className="text-error text-center p-8 mt-12 bg-surface rounded-xl mx-auto max-w-2xl shadow-lg">
        <ExclamationCircleIcon className="h-16 w-16 text-error mx-auto mb-4" />
        <p className="text-xl font-semibold mb-2">Error Loading Questions</p>
        <p className="text-textSecondary">{error}</p>
        <Button onClick={fetchQuestions} className="mt-6">Retry Loading</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 animate-fade-in-up delay-300">
        <h2 className="text-3xl md:text-4xl font-bold text-text text-center md:text-left">Question List</h2>
        <Button
          onClick={handleCheckAllQuestions}
          disabled={checking || questions.length === 0}
          className="px-6 py-3 text-lg"
        >
          {checking ? `Checking... (${checkedCount}/${questions.length})` : 'Check All Questions'}
        </Button>
      </div>

      {questions.length === 0 && !loading && (
        <div className="text-textSecondary text-center text-lg mt-16 p-8 bg-surface rounded-xl shadow-lg animate-fade-in-up delay-400">
          <ExclamationCircleIcon className="h-16 w-16 text-textSecondary mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">No Questions Found</p>
          <p>Add some questions to the `new_questions` table in Supabase to get started!</p>
          <Button onClick={fetchQuestions} className="mt-6">Refresh List</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
};

export default QuestionChecker;
