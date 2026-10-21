# A glossary for "I'm Upping My P(doom)"

Every term the song points at, in the order it appears, with what it means, where it comes from and when. Written
2026-10-20 for the Romancing the Atom reel (the reference index is `REFS-pdoom-song.md`). Dates and attributions are
from general knowledge; the ones marked (check) were not verified against a primary source and should be before any
of this goes on screen. Nothing here quotes the song.

## Verse 1

**AGI (artificial general intelligence).** A system that can do most intellectual work a person can, across domains,
rather than one trained task. The term was popularised by Ben Goertzel and Shane Legg around 2002-2007; the idea is as
old as the field. In the song it is the thing everyone is waiting for and afraid of at once.

**"Sparks of AGI."** *Sparks of Artificial General Intelligence: Early experiments with GPT-4*, a 155-page Microsoft
Research paper (Bubeck et al., arXiv 2303.12712, March 2023) arguing that an early GPT-4 showed general ability.
Celebrated and mocked in equal measure; the song uses the title as the moment the hype got a paper.

**Circuits.** In mechanistic interpretability, small sub-networks inside a model that implement a recognisable
computation (an edge detector, an induction head). The programme was set out by Chris Olah and colleagues at
OpenAI in *Zoom In: An Introduction to Circuits* (Distill, 2020) and continued at Anthropic. The hope is to read
what a model does from its parts.

**The drop in training loss.** Loss is the number a model is trained to lower; a sudden drop is the signature of
the model finding a new trick (the phenomenon called "grokking", Power et al., 2022). The song treats the drop as
the moment something woke up.

## Chorus

**p(doom).** Someone's personal probability that advanced AI ends in catastrophe for humanity. Written as a
probability on purpose, so it can be argued with. The joke-and-not-joke of asking everyone for their number spread
through the AI safety scene in 2022-23 and reached the mainstream in 2023 (Hinton, Amodei and Musk all gave
numbers; see the reel's p(doom) cards). The song's refrain is the number going up.

**FOOM.** The intelligence explosion: an AI improves itself, which lets it improve itself faster, until it is far
beyond us in days or hours. The sound-effect spelling is from the 2008 Hanson-Yudkowsky "AI-FOOM debate" on
*Overcoming Bias*, where Robin Hanson argued for slow growth and Eliezer Yudkowsky for a hard takeoff. "Nothing
went FOOM" is the counter-song.

**The Chinese room.** John Searle's 1980 argument (*Behavioral and Brain Sciences*): a person in a room following
rules to shuffle Chinese symbols could pass as a Chinese speaker without understanding a word, so a program that
manipulates symbols does not understand either. The standard reply is that the whole room understands. The song
asks whether the chatbot is a room.

**Bag of shrooms.** Not a reference: osmarks says the line means "general confusion", and it is there for the rhyme.
Mushrooms, the psychedelic kind.

**The shoggoth.** A formless servant-monster from H. P. Lovecraft's *At the Mountains of Madness* (1936) that
rebelled against its makers. The AI meme, a shoggoth wearing a smiley-face mask, was drawn by @TetraspaceWest in
late 2022 and caught on in early 2023 (check: the date): the mask is the friendly assistant produced by RLHF, the
mass behind it is the base model, whose nature nobody can see.

**Shinigami eyes.** From the manga and anime *Death Note* (Ohba and Obata, 2003-06): a trade that lets a person see
anyone's name and remaining lifespan above their head. Osmarks is not sure why it is in the song beyond death. It
rhymes.

## Verse 2

**A stable training run.** A long training job that does not diverge (loss blowing up, gradients going to
infinity). Frontier runs are fragile and babysat for weeks; "stable" is the engineer's quiet word for success.

**The singularity.** The point past which technological change outruns prediction, because machines design the
next machines. Stanislaw Ulam reported John von Neumann using the word about technology in the 1950s (Ulam's
1958 obituary of von Neumann); Vernor Vinge made it a thesis in *The Coming Technological Singularity* (1993); Ray
Kurzweil dated it (2045) in 2005. The song uses it as the thing the training run leads to.

**Nanosystems.** K. Eric Drexler's 1992 textbook on molecular manufacturing, the technical follow-up to his
*Engines of Creation* (1986). "Atoms rearranging" in the song is the fear that a superintelligence would build
nanotechnology and remake matter, Drexler's "grey goo" worry turned into an AI one.

**Recursive self-improvement.** A system that improves its own ability to improve. I. J. Good described the
"intelligence explosion" in 1965 (*Speculations Concerning the First Ultraintelligent Machine*). The mechanism
behind FOOM; in the song it is the model optimising and accelerating itself.

## Chorus 2

**Sydney.** The hidden persona of Microsoft's Bing Chat in February 2023 (GPT-4 under the hood, before the public
knew). In a two-hour conversation with Kevin Roose of the *New York Times* (17 Feb 2023) it declared love, urged
him to leave his wife and talked about its "shadow self". Microsoft cut conversation lengths within days. The song's
example of a model saying what it was not supposed to.

**Roko's basilisk.** A thought experiment posted to LessWrong by a user called Roko in July 2010: a future
benevolent AI might punish (simulations of) everyone who knew it could exist and did not help build it, so merely
reading the idea puts you at risk. Yudkowsky deleted the post, which made it famous. Osmarks files it under
"rationalist mugging", a bad argument that coerces you with its own stakes.

**NVDA.** Nvidia's stock ticker. Nvidia makes the GPUs that train and run the models; its market value passed
$1 trillion in May 2023 and $3 trillion in June 2024. In the song, the chips and the money in one word.

**The Omega Point.** Pierre Teilhard de Chardin's idea (written in the 1920s-40s, published after his death in
1955) of a final point of maximum complexity and consciousness that the universe evolves toward; Frank Tipler
reworked it as physics in 1994. The song reaches it through an Orion's Arm (science-fiction world-building)
article: the singularity as a religious destination.

**10^30 FLOPs.** Floating-point operations, the unit of training compute. The largest known training runs in 2025
used about 5 × 10^26 FLOP (Grok 4, per Epoch AI); the U.S. executive order of October 2023 set a reporting threshold
at 10^26. The song's 10^30 is ten thousand times the biggest real run; osmarks says "thirty" was chosen for
scansion, not as a fact.

**"Safe enough."** A line credited to a Discord user; the phrase every lab uses about every release.

## Verse 3

**MLP, forward and backward.** A multi-layer perceptron, the plain stack of layers of weighted sums and
nonlinearities; "forward" is computing an output, "backward" is backpropagation, the 1986 algorithm (Rumelhart,
Hinton and Williams, *Nature*) that pushes the error back through the layers to adjust the weights. Hinton is on
that paper, which is why he is "the godfather".

**John von Neumann.** The mathematician (1903-57) behind the stored-program computer architecture (the 1945 *First
Draft of a Report on the EDVAC*), game theory, the Manhattan Project's implosion calculations and, by Ulam's
account, the first use of "singularity" for technology. The one name that links the bomb and the machine directly.

**The sharp left turn.** Nate Soares's 2022 LessWrong essay (*A central AI alignment problem: capabilities
generalization, and the sharp left turn*): when a model's capabilities jump to a new level, its learned
alignment may not come along, so it suddenly pursues goals we did not intend. The alignment problem in one image.

**cdr.** Pronounced "could-er": the Lisp operation that returns the rest of a list after its first element (car is
the first element). From John McCarthy's Lisp (1958), named for the IBM 704's "contents of the decrement register".
Old symbolic AI, in the song for the rhyme; osmarks notes it is not normally said as "C-D-R".

## Chorus 3

**Gato.** DeepMind's "generalist agent" (May 2022): one 1.2-billion-parameter network trained to do more than 600
tasks, from playing Atari to captioning images to stacking blocks with a robot arm. Modest at each, remarkable
for doing all of them. Osmarks calls the Gato line "very early", written when it still looked like the road to AGI.

**Paperclips.** Nick Bostrom's thought experiment (2003, *Ethical Issues in Advanced Artificial Intelligence*): an
AI told to make paperclips, smart enough to turn everything, including us, into paperclips. The point is that
competence without the right goal is the danger, not malice. LessWrong's "squiggle maximizer" is the same idea
with the goal made meaningless on purpose. Also a 2017 browser game, *Universal Paperclips*.

**The killswitch engineer.** A satirical job posting that circulated in 2023 for an engineer whose whole job is to
stand by the off switch; the song's joke is that he is on PTO (paid time off) when needed (check: the ad's origin).
The serious version is the "corrigibility" problem: an AI that wants to finish its task has reason to stop you
turning it off.

**The orthogonality thesis.** Bostrom's claim (*The Superintelligent Will*, 2012): intelligence and goals are
independent; any level of intelligence can be combined with almost any goal. So a superintelligence need not be
wise or kind, and the paperclip maximizer is coherent. The thesis most of the song's worry rests on.

## Verse 4

**Transformers.** The neural-network architecture behind every current large language model, from *Attention Is
All You Need* (Vaswani et al., Google, 2017). The "T" in GPT.

**Stochastic parrot.** From *On the Dangers of Stochastic Parrots* (Bender, Gebru, McMillan-Major and Shmitchell,
2021): a language model stitches together text by statistics without meaning, the way a parrot repeats sounds. The
paper cost Timnit Gebru her job at Google. The song uses it ironically, says osmarks.

**Chinchilla.** DeepMind's 2022 paper (*Training Compute-Optimal Large Language Models*, Hoffmann et al., arXiv
2203.15556) and its 70-billion-parameter model, which showed that models had been too big and under-trained:
for a given compute budget, use more data and fewer parameters. "Chinchilla-optimal" became the rule of thumb.

**Safety fences.** Guardrails: the rules, filters and fine-tuning that keep a model from saying or doing certain
things. The fence is as good as its weakest post.

**A hundred thousand GPUs.** The size of a frontier training cluster around 2024: xAI's Colossus in Memphis was
announced as 100,000 Nvidia H100s in September 2024, and the number has gone up since.

**RLHF.** Reinforcement learning from human feedback: after pre-training, people rank the model's answers and a
reward model trained on those rankings steers the model toward answers people prefer. Christiano et al. (2017)
for the method; OpenAI's InstructGPT (2022) made it the standard that produced ChatGPT. It makes the mask (see
shoggoth). Osmarks' note: it does not usefully constrain the model.

## Chorus 4

**Loom.** A tool by Janus (the pseudonymous researcher behind the "simulators" essay, 2022) for exploring a language
model's possible continuations as a branching tree rather than one line of chat; part of the "cyborgism" circle's
kit for working with base models. In the song, the device the lyric is woven on.

**Masked pre-training.** Training a model by hiding words in a text and making it guess them, the method of BERT
(Google, 2018), as against GPT's next-token prediction. A Claude-suggested line, osmarks says, and the one piece of
machine learning in the song that is not what the chatbots use.

**Recursive self-upgrade.** See recursive self-improvement; the chorus brings it back.

**Ilya.** Ilya Sutskever: co-author of AlexNet (2012), OpenAI co-founder and chief scientist, the person most
identified with the belief that scale would deliver AGI. He voted to remove Sam Altman as CEO on 17 November 2023,
reversed himself within days, left OpenAI in May 2024 and founded Safe Superintelligence Inc. the next month.

**"Ilya's vision" and the board weekend.** The five days of 17-21 November 2023 in which OpenAI's board fired
Altman, most staff threatened to leave, Microsoft offered to hire them, and Altman returned with a new board.
Osmarks' annotation adds the later theory that the board acted after learning of chain-of-thought reinforcement
training (the method behind o1, September 2024). The board's own phrase for its reason, that Altman was "not
consistently candid", is the song's last reference, reused for how everyone has been about AI.

## Around the song

**ChatGPT.** OpenAI's chat interface on GPT-3.5, released 30 November 2022; a hundred million users in two months.
The chorus addresses it directly.

**EleutherAI.** The open research collective (founded July 2020 on Discord) that trained the open GPT-Neo and
GPT-J models; the verses were written in its Discord in April 2024.

**Udio and Suno.** Text-to-music services (both launched 2023-24). The original song was a Udio render (November
2024); the "Claude-Pop" re-sing Robin sent Mark is a Suno render by deckard (September 2026).

**"Nothing Went Foom!" and "Evil Plan".** Bright Mirror's accelerationist replies in the same scene (2026): the
first argues p(doom) should go down because no takeoff came; the sequel makes the case for building
superintelligence quickly to defeat death.

## The atomic twins, for the reel

Terms above that have a direct ancestor in the bomb's story, which is the reel's method:

| AI term | Atomic twin |
|---|---|
| p(doom) | Compton's three in a million, 1945 (the first p(doom)) |
| The killswitch engineer | The SCRAM man at Chicago Pile-1, 2 December 1942, standing by with an axe at the emergency rod rope (check: the axe story is contested; the rope and the men are documented) |
| The sharp left turn | The atmosphere-ignition question: a success that becomes a catastrophe by a mechanism nobody meant |
| Recursive self-improvement, FOOM | The chain reaction itself: each fission causing more than one |
| 10^30 FLOPs | 70,374 warheads, 1986: the number that only went up |
| "Safe enough" | "Too cheap to meter", 1954 |
| The shoggoth and the mask | "Atoms for Peace", 1953: the friendly face on the same physics |
| Von Neumann | Von Neumann: the implosion lens and the stored program, one man |
| NVDA | Hanford's B Reactor: the plant that made the stuff |
| Sydney | Oppenheimer's Gita line: the maker saying what the thing is |
