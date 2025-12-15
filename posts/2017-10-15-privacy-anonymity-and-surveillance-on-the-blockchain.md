---
title: "Privacy, Anonymity and Surveillance on the Blockchain"
date: 2017-10-15
description: "Exploring the challenges of privacy on public blockchains and the emerging solutions like Zero Knowledge Proofs and ring signatures."
tags: ["blockchain", "privacy", "technology", "cryptocurrency"]
draft: false
---

*Originally published in October 2017. At that time, I was fascinated by the potential for the technology to bring privacy and data ownership. Even today, privacy remains a challenge for the blockchain as it tries to attract more users while balancing the need for privacy.*

---

The blockchain is a decentralized, digital ledger that records transactions on multiple computers in a secure and transparent manner. It eliminates the need for intermediaries, allowing parties to make direct, secure transactions without the risk of tampering or fraud.

## The Four Key Characteristics of Blockchain Technology

### 1. Cryptographic Security
All transactions are signed by a public/private key protecting them from fraud.

### 2. Decentralized
Blockchain is a decentralized peer-to-peer network where all transactions are replicated, which means that no single participant can tamper with the data. To update the data a majority consensus is required.

### 3. Immutable Ledger
A write-once database that records every transaction that occurs. An immutable history of every transaction.

### 4. Smart Contracts
Smart contracts are programmable contracts that secure, enforce and execute settlement of recorded agreement between people and organizations. (Definition proposed by Nick Szabo)

## Types of Blockchain

There are several types of blockchain, including:

- **Public blockchain:** Anyone can participate in the consensus of validating the chain and decide which one gets added to the blockchain. All transactions are public and anyone can read them. Examples include Bitcoin and Ethereum.

- **Consortium blockchain:** The blockchain consensus is validated by a set of nodes. The right to read may be public or restricted.

- **Fully private blockchain:** This is a centralized server controlled by one organization.

- **Hybrid blockchain:** A combination of two or more blockchain networks to create a new, unified network.

- **Sidechain:** A separate blockchain that operates alongside a main blockchain, providing additional functionality.

## The Case for Public Blockchains

We will focus on public blockchains, which are open ledgers accessible to anyone and where all transactions can be viewed.

This transparency is good for:

- **Ensuring validity:** All transactions are valid (e.g., people want to be able to see that their vote has been counted).

- **Transparency:** All transactions are public and everyone can access the history to know how it got to the current state (e.g., for public service or government, anyone can see how the taxes they are paying are spent and fight corruption).

- **Immutability:** The "Proof of Work" process used to validate each block makes it impossible to modify the state of the blockchain.

## The Transparency Problem

The transparency can be used against users.

There are several cases where the transparency of blockchain could be used against people. For example, knowing someone's address, it becomes possible to track how they spend money and to whom they send money.

### How About Fungibility?

Fungibility refers to the property of a commodity, currency or asset that makes it interchangeable with another unit of the same value. Fungibility is important in financial transactions, as it ensures that each unit of currency or asset has the same value, regardless of its history or origin.

With the transparency of an open ledger like a public blockchain, where the provenance of every coin can be traced, we can envision a scenario where individuals begin to reject money for various reasons. For example, if a coin has been traded on an illegal exchange platform, it may be refused. Similarly, one could imagine being refused credit at an organic shop if their bank is associated with deforestation in the Amazon.

## How Can We Bring More Privacy for Users?

Different solutions are being developed to bring more privacy on the blockchain:

- **Private blockchain** can ensure privacy for transactions if you trust the nodes in charge not to disclose the information—but in this case it is really difficult to guarantee the integrity of the process.

- **Mixers and CoinJoins** offer solutions to privacy with the only problem that you must trust the middleman and hope that it never gets compromised or hacked by a third party.

- **Public blockchain ledger** offers a solution if you build applications that make sure that private data doesn't get on the ledger or is stored in encrypted form.

One of the challenges is to guarantee the integrity of the process while ensuring privacy at the same time.

## How to Encrypt Data and Prove It Satisfies Rules?

**Linkable ring signature** is one of the options being explored. The linkable ring signature is a cryptographic signature where the identity of the signer in a ring signature remains anonymous, but two ring signatures can be linked if they are signed by the same person.

For e-voting, linkable ring signature can be used to allow a person's vote without revealing their identity—but two votes from the same person will be invalid.

The Ethereum Metropolis (Byzantium) upgrade added a new cryptographic tool (zk-SNARKs) that can do linkable ring signature, and we are seeing new features to improve privacy.

## The Future of Blockchain Privacy

*Updated in 2023:* Various solutions are being developed to enhance privacy on the blockchain. One such technology is **Zero Knowledge Proof**, which offers a secure way to verify information without revealing the actual data.

---

Thank you for reading. If you found this post valuable and would like to receive more information like this, please consider subscribing to my newsletter. I regularly share updates on new technologies, blockchain, AI, and other topics that may be of interest to you.
