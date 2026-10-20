'use strict';
// Training compute of notable AI systems, per-year maximum.
// Source: Our World in Data grapher 'artificial-intelligence-training-computation'
// (Epoch AI, 'Parameter, Compute and Data Trends in Machine Learning'), downloaded 2026-10-19.
// Unit: petaFLOP (1e15 floating-point operations), total training computation.
// Licence: CC BY 4.0 (Our World in Data; Epoch AI data is CC BY).
// Citation: Epoch AI (2026) - with major processing by Our World in Data. "Training computation (petaFLOP)" [dataset]. Epoch AI, "Parameter, Compute and Data Trends in Machine Learning" [original data].
// Chart title: Computation used to train notable artificial intelligence systems
// Rows in source: 536 systems, 1950-07-02 to 2026-08-07. Column last updated 2025-03-12.
const COMPUTE_UNIT = 'petaFLOP';
const COMPUTE_SOURCE = 'Epoch AI via Our World in Data, CC BY 4.0';
// [year, petaFLOP, system name]: the largest training run published that year.
const COMPUTE = [
  [1950, 4e-14, "Theseus"],
  [1957, 6.948949e-10, "Perceptron Mark I"],
  [1959, 6e-07, "Pandemonium (morse)"],
  [1960, 7.2e-07, "Perceptron (1960)"],
  [1962, 1.5592501e-09, "Linear Decision Functions"],
  [1963, 2.25e-08, "Print Recognition Logic"],
  [1965, 1.08e-09, "Heuristic Reinforcement Learning"],
  [1966, 1.0591706e-07, "LTE speaker verification system"],
  [1975, 5.184e-09, "Cognitron"],
  [1980, 2.7373824e-07, "Neocognitron"],
  [1983, 3.24e-07, "ASE+ACE"],
  [1986, 6.7392e-07, "MLP with back-propagation"],
  [1987, 2.8328002e-05, "NetTalk (transcription)"],
  [1988, 2.96425e-07, "MLN-ASR"],
  [1989, 0.001496338, "Zip CNN"],
  [1990, 7.87752e-05, "SexNet compression"],
  [1991, 7.5474e-05, "Weight Decay"],
  [1992, 0.018232157, "TD-Gammon"],
  [1993, 0.01286957, "Siamese-TDNN"],
  [1994, 0.018621901, "Predictive Coding NN"],
  [1995, 0.0001955448, "LISSOM"],
  [1996, 0.0008817336, "MUSIC perceptron"],
  [1997, 0.031512, "LSTM"],
  [1998, 0.0028109376, "LeNet-5"],
  [1999, 0.0080136005, "RECONTRA-categorized"],
  [2000, 6.339, "Neural LM"],
  [2001, 0.063, "Decision tree (classification)"],
  [2003, 1.6668692, "NPLM (AP News)"],
  [2004, 2.7820802, "LMICA"],
  [2005, 0.115848005, "Hierarchical LM"],
  [2006, 0.7452, "SVM-CNN"],
  [2007, 1449.4465, "SB-LM"],
  [2008, 1.6145999e-06, "GNN"],
  [2009, 4.1818523, "LCNP MNIST"],
  [2010, 53.960003, "RNN LM"],
  [2011, 52.0, "CNN Committee (MNIST)"],
  [2012, 600.0, "Unsupervised High-level Feature Learner"],
  [2013, 2612.736, "DistBelief NNLM"],
  [2014, 297600.0, "SNM-skip"],
  [2015, 380000.03, "AlphaGo Fan"],
  [2016, 6620000.0, "GNMT"],
  [2017, 843000.06, "JFT"],
  [2018, 8743950.0, "ResNeXt-101 32x48d"],
  [2019, 107734000.0, "AlphaStar"],
  [2020, 314000000.0, "GPT-3 175B (davinci)"],
  [2021, 2047000000.0, "FLAN 137B"],
  [2022, 2741500200.0, "Minerva (540B)"],
  [2023, 50000003000.0, "Gemini 1.0 Ultra"],
  [2024, 38000000000.0, "Llama 3.1-405B"],
  [2025, 500000000000.0, "Grok 4"],
  [2026, 38700003000.0, "Composer 2.5"],
];
// [label, year, petaFLOP, system name as listed in the dataset]
const COMPUTE_MARKS = [
  ["Perceptron Mark I", 1957, 6.948949e-10, "Perceptron Mark I"],
  ["AlexNet", 2012, 470.0, "AlexNet"],
  ["GPT-2", 2019, 1920000.1, "GPT-2 (1.5B)"],
  ["GPT-3", 2020, 314000000.0, "GPT-3 175B (davinci)"],
  ["GPT-4", 2023, 21000000000.0, "GPT-4 (Mar 2023)"],
  ["Largest 2024", 2024, 38000000000.0, "Llama 3.1-405B"],
  ["Largest 2025", 2025, 500000000000.0, "Grok 4"],
  ["Largest 2026", 2026, 38700003000.0, "Composer 2.5"],
];
