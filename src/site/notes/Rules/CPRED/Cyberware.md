---
{"dg-publish":true,"permalink":"/rules/cpred/cyberware/","dg-note-properties":{}}
---

[[Rules/Homebrew\|Homebrewed]] completely from the ground up.

<mark style="background: #fee801;">MAIN RULE:</mark> Cyberware **is activated**. When doing so, it exponentially lowers the [[Rules/CPRED/Difficulty Rating\|Difficulty Rating]] of a relevant roll. Each Cyberware has a [[Rules/CPRED/Quality\|Quality]] value (from 1 to 5) that determines how much the [[Rules/CPRED/Difficulty Rating\|DR]] is lowered by, in [[Rules/CPRED/Difficulty Rating\|DR bands]][^3][^5]. 

Before resolving the check, the player adds +Quality[^8] to his Cyberpsychosis tracker, a [[Rules/Homebrew\|Homebrew]] element marked down under Addiction in the Character Sheet. 
If the Cyberpsychosis final value is higher than the player's current Humanity (WILL+EMP), they roll a d10 to [[Rules/CPRED/Cyberware#Cyberpsychosis\|determine the consequences]] after attempting their roll. 

<mark style="background: #fee801;">WARNING!</mark> This overwrites standard Cyberware rules, since it modifies how [[Rules/CPRED/Humanity\|Humanity]] is calculated. Apart from [[Rules/CPRED/Cyberware#Exotic Cyberware\|specific edge cases]][^24], most Cyberware only interacts with [[Rules/CPRED/Humanity\|Humanity]] upon usage, not on installation. 

For examples on every Cyberware option, see [[Rules/CPRED/Cyberware Types\|Cyberware Types]].

### Core Rules
There are **10 classes of Cyberware**, specifically adapted from Cyberpunk 2077's system, which outline the 10 "core powers" that bionic enhancement can grant. Under each class, different Cyberware can be chosen[^6], **up to a maximum of 3 slots per type[^7].** Each class alters the gameplay significantly by itself.

Each Cyberware has a [[Rules/CPRED/Quality\|Quality]] attribute ranging from **1 to 5**, determining their effectiveness at their given task.

##### Starting Cyberware
A starting character may buy as many individual pieces of [[Rules/CPRED/Cyberware\|Cyberware]] as they desire, up to their starting eurodollars. **For the starting Cyberware,** use the minimum price in the price bands of [[Rules/CPRED/Quality\|Quality]] to value each implant based on the number of points spent in class, from 50eb (Costly) for [[Rules/CPRED/Quality\|Quality]] 1 to 5000 eb (Luxury) for [[Rules/CPRED/Quality\|Quality]] 5. The price for future implants can vary depending on availability, quality etc., but should still be in the corresponding price range.

##### Upgrading Cyberware
**Upgrading Cyberware** requires going to a proficient [[Rules/CPRED/Roles/Medtechie\|Ripperdoc]] and paying a sum equal to the minimum cost of the [[Rules/CPRED/Quality\|next price band]]. Some [[Rules/CPRED/Roles/Medtechie\|Ripperdocs]] may be specialized in certain types of surgeries, so finding the right one for your needs may be difficult in some places.


### Cyberpsychosis
For more about the in-universe lore of Cyberpsychosis, see [[Lore/Cyberpsychosis\|this page]].

<mark style="background: #fee801;">MAIN RULE:</mark> Mechanically, symptoms of Cyberpsychosis begin manifesting once the player's Cyberpsychosis exceeds their [[Rules/CPRED/Humanity\|Humanity]] (=WILL+EMP). Upon this occurrence, players roll a d10. **If the result is higher than 5, a Cyberpsychosis Symptom occurs.**

The severity of the symptom is proportional to this result: higher values indicate worse symptoms like [[Lore/Cyberpsychosis\|Cy-rage]], while lower values may be something as simple as a nosebleed.

The Cyberpsychosis Tracker's value decays over time (1d6/week), when having positive human interaction (1d6-2d6) or when using Cyberpsychosis-specific medication (see [[Rules/CPRED/Drugs/Omega Blockers\|Omega Blockers]]), which can be used in Therapy or as an episode blocker.

- **Optional [[Rules/Homebrew\|Homebrew]] for deeper narrative impact:** the die value determines the strength of a Flashback scene in which the PC either hallucinates something, reminisces about a dead connection or any other element that stirs strong emotions; this can be used to great effect to then explain any strong reaction to the stimuli[^9]

To keep up with [[Rules/CPRED/Cyberpunk RED\|Cyberpunk RED]]'s rules:
- Lowering your Empathy (=Humanity x 10) under 3 still leads to manifestation of Dissociative Disorders symptoms
- [[Rules/CPRED/Humanity\|Humanity]] loss can still be regained by going to Therapy (2d6/4d6 regain); upon these visits, PCs may also clear 1/2 symptoms depending on the type of Therapy 

##### Symptoms
These values are based on the d10 rolled if the player, upon adding to their Cyberpsychosis Tracker, exceeds the value of their WILL+EMP.

- **1-4 - nothing**
- **5 - visible physical damage**
	- a brief seizure (1-2 turns) or a nosebleed (d6)
- **6 - withdrawal symptoms** 
	- scratching, twitching etc. as well as a strong desire to install or use Cyberware; until this need is met, the PC suffers -2 to their COOL and WILL
- **7 - psychological degradation**
	- Recurrent nightmares, paranoia, signs of psychosis and even schizotypal behavior, strange beliefs, hallucinations
- **8 - psycho-physical outburst**
	- Mild Cy-rage episode, like a verbal conflict, impulsive or aggressive behavior, with immediate control after a brief moment of unawareness
- **9 - mild physical episode**
	- Cy-rage episode where severe antisocial behavior is expressed, especially of a violent, aggressive or hostile nature; from this state, the player can struggle to regain control of their character 
- **10 or greater - severe & violent episode** 
	- Extreme Cy-rage episode where severe antisocial behavior is expressed, most likely of a violent nature, including hallucinations generated by paranoia; recovery is only possible by shutting down brain functions temporarily (special medication[^10], K.O. or death)

### Theoretical Foundations
*this is game design philosophy. useful for prospecting storytellers*

Cyberware in any Cyberpunk TTRPG is the equivalent to a Magic system in a fantasy setting. Where Vampire has Disciplines, the splitting of supernatural power by lineage into skill trees, games like DnD oftentimes offer a large pool of Magic feats from which players can choose at will.

Such is the case with Cyberware, which creates **the Infinite List Problem**, where players can access a truly astounding variety of Cyberware, but which essentially boils down to only a few very powerful/optimal slots, with others like fashion or style falling short. By pulling from Sid Meier, we learn that players will optimize the fun out of a game. So, you don't need *cool* Cyberware (a finger-lighter) to be a Humanity-draining piece of tech you have to install. Rather, you just have that on you.

To solve **the Infinite List Problem** without building a complicated and unrewarding system, we need to find an elegant and practical solution where players feel rewarded for using Cyberware[^1] to the point they themselves become as addicted and dependent on the tools they use as their characters in the narrative.

Our solution is twofold: 
- **uncoupling the mechanics from the balancing;** our hope is for the end result to translate into more "busted" Cyberware, which can then lead to variety of gameplay and strategy, but also creativity;
- adopting **the Grappling Hand Method**; instead of highlighting a specific action or set of actions that an item can fulfill ("this can hide 1 weapon the size of X"), we instead give the player **a tool**[^4] that they can use in various situations the way they see fit. 

Cyberware should not be balanced mechanically with one another. Rather, they should be **balanced in the fiction** (GM notices that a particular Arm Cyberware has been used for a bunch of difficult rolls, so he adjusts the reaction of NPCs - "Nice chrome you got there" ) or through **other means like access, price, reliability, concealment**. 

##### Inspiration
- [The Future is Now, Old Man](https://www.storytellersvault.com/en/product/415807/the-future-is-now-old-man); A WoD supplement for V5 that details Cyberware rules compatible with Discipline-like systems
- [Cyberpunk: Edgerunners](https://en.wikipedia.org/wiki/Cyberpunk:_Edgerunners); for the depiction of [[Lore/Cyberpsychosis\|Cyberpsychosis]] and the "descent" into it;
- [Cyberpunk 2077](https://en.wikipedia.org/wiki/Cyberpunk_2077) for the more seamless integration of mechanical prowess and diversity in Cyberware, especially for combat purposes

Although Cyberpunk 2020 and its newer brother, [[Rules/CPRED/Cyberpunk RED\|Cyberpunk RED]] are both inspirations and foundational to this module, its very obvious that 2077's more "biology-first" approach is useful, as splitting "neuralware" into 3 enhances the portability of all its moving parts.

### Footnotes

[^1]: Interestingly, many players in my Cyberpunk games have chosen to engage briefly, if at all, with the Cyberware system, regardless of TTRPG (CPRED, 2020, CY_BORG). These players, as I recall, have complaints about Cyberware being too much effort for what its worth (2020/RED) or personal mantra/wishes (CY_BORG). A rhetorical question arises: if you're a Cyberpunk player without the cyber, what are you?

[^3]: Difficulty Rating scale exponentially upwards. In that sense, the difference between Everyday and Difficult (13 & 15) is only 2, while the difference between Incredible and Legendary (19 & 24) is 5. This Cyberware system is meant to reward players for trying to do superhuman feats, while also highlighting the impossibility for a normal human to even attempt them.

[^4]: An item has a role (combat/exploratory/social), maybe, but tools transcend classic separation by allowing the player to use their (un)limited creativity to come up with ingenious ways of using the tool. Tools should give enough space but clear directions so the player knows their attributes but are still curious to explore.

[^5]: For example, when trying to spot a Ghost-suit sniper in a faraway building, the roll would have a [[Rules/CPRED/Difficulty Rating\|Difficulty Rating]] of Legendary (29). However, when using my Kiroshi Deadlock Cyberoptics (Quality 4), the Perception roll required is lowered by 4 levels of [[Rules/CPRED/Difficulty Rating\|DR]], from Legendary to Difficult(15).

[^6]: A player who frequently gets into combat might prefer to install ballistic plates under their skin (Integumentary System > Armor), while a stealthier player may try to install concealment plates to prevent Cyberware detection by scanners (Integumentary System > Concealment).

[^7]: This is inspired by the 2077 Operating System slot, where there are 3 core types: Sandevistans (slow down time), Cyberdecks (allow you to hack), Berserkers (promote combat survivability)

[^8]: So, when using Kiroshi Deadlock Cyberoptics (Quality 4), the player would add a +4 to the Cyberpsychosis Tracker.

[^9]: See [Maine's hallucinations from Cyberpunk: Edgerunners](https://cyberpunk.fandom.com/wiki/Girl_on_Fire).

[^10]: While [[Lore/Organizations/MAXTAC\|MAXTAC]] could use this on the Cyberpsychos they go up against, in a tactical operation throwing a syringe into a raging maniac's chest isn't quite the most efficient of putting them down.

[^21]: "I try to shatter the glass by using the points I have in Integumentary System. If you'll allow me, my elbow is covered by a thin line of flexible metal, which allows me to break the glass without getting any shards stuck." This would lower the already easy check of Everyday (13) to Simple (9). 

[^22]: For example, with the Cyberware class still at 1, another piece of Cyberware would still be Costly, so anywhere between 50eb and 100eb.

[^23]: So, upgrading from Arms 3 to 4 with 2 Cyberware installed would cost 1000eb * 2 = 2000eb.

[^24]: In specific situations, like Grafted Muscle & Bone Lace, Cyberware instead substracts its Quality from the user's [[Rules/CPRED/Humanity\|Humanity]] when installed, permanently. Cyberware that behaves like this usually offers "passive" bonuses.
