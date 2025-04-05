// SearchPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const questions = [
  { question: "What symptoms are you experiencing?", placeholder: "e.g., headache, fever", key: "symptoms", icon: "🤒" },
  { question: "How long have you had these symptoms?", placeholder: "e.g., 2 days", key: "duration", icon: "⏱️" },
  { question: "Do you have any existing conditions?", placeholder: "e.g., diabetes", key: "conditions", icon: "📋" },
  { question: "Are you taking any medications?", placeholder: "e.g., insulin", key: "medications", icon: "💊" },
  { question: "Any allergies?", placeholder: "e.g., penicillin", key: "allergies", icon: "⚠️" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const inputVariants = {
  focus: { scale: 1.02, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" },
  hover: { scale: 1.01 }
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export default function SearchPage() {
  const [formData, setFormData] = useState({
    symptoms: "", duration: "", conditions: "", medications: "", allergies: ""
  });
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (!formData[questions[step].key]) return;
    if (step < questions.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      navigate(`/results?q=${encodeURIComponent(JSON.stringify(formData))}`);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [questions[step].key]: e.target.value }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && formData[questions[step].key]) {
      handleNext();
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%)"
      }}
    >
      <motion.div
        variants={cardVariants}
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "white",
          padding: "2rem",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}
      >
        <motion.div
          style={{
            textAlign: "center",
            marginBottom: "2rem"
          }}
        >
          <motion.h2
            style={{
              fontSize: "2rem",
              color: "#4338ca",
              marginBottom: "0.5rem"
            }}
          >
            {questions[step].icon} {questions[step].question}
          </motion.h2>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          style={{
            width: "100%",
            height: "6px",
            background: "#e5e7eb",
            borderRadius: "3px",
            marginBottom: "2rem"
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${((step + 1) / questions.length) * 100}%` 
            }}
            style={{
              height: "100%",
              background: "#4338ca",
              borderRadius: "3px"
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <motion.input
          variants={inputVariants}
          whileFocus="focus"
          whileHover="hover"
          type="text"
          placeholder={questions[step].placeholder}
          value={formData[questions[step].key]}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.1rem",
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            marginBottom: "2rem"
          }}
        />

        <motion.div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem"
          }}
        >
          {step > 0 && (
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setStep(prev => prev - 1)}
              style={{
                padding: "1rem 2rem",
                background: "#e5e7eb",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer"
              }}
            >
              Back
            </motion.button>
          )}
          
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleNext}
            disabled={!formData[questions[step].key]}
            style={{
              padding: "1rem 2rem",
              background: formData[questions[step].key] ? "#4338ca" : "#e5e7eb",
              color: formData[questions[step].key] ? "white" : "#9ca3af",
              border: "none",
              borderRadius: "12px",
              cursor: formData[questions[step].key] ? "pointer" : "not-allowed",
              marginLeft: "auto"
            }}
          >
            {step < questions.length - 1 ? "Next" : "Get Medical Advice"}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
