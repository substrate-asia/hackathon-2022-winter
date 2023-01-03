export const domain = {
    "name": "snapshot",
    "version": "0.1.4"
}

export interface Space {
    from?: string;
    space: string;
    timestamp?: number;
    settings: string;
}

export interface Vote {
    from?: string;
    space: string;
    timestamp?: number;
    proposal: string;
    choice: number | number[] | string;
    metadata: string;
}

export interface Proposal {
    from?: string;
    space: string;
    timestamp?: number;
    type: string;
    title: string;
    body: string;
    choices: string[];
    start: number;
    end: number;
    snapshot: number;
    network: string;
    strategies: string;
    plugins: string;
    metadata: string;
}

export const singleChoiceVoteTypes = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'bytes32' },
        { name: 'choice', type:  'uint32'  },
        { name: 'metadata', type: 'string' }
    ]
}

export const multiChoiceVoteTypes = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'bytes32' },
        { name: 'choice', type:  'string'  },
        { name: 'metadata', type: 'string' }
    ]
}

export const proposalTypes = {
    Proposal: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'type', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'body', type: 'string' },
        { name: 'choices', type: 'string[]' },
        { name: 'start', type: 'uint64' },
        { name: 'end', type: 'uint64' },
        { name: 'snapshot', type: 'uint64' },
        { name: 'network', type: 'string' },
        { name: 'strategies', type: 'string' },
        { name: 'plugins', type: 'string' },
        { name: 'metadata', type: 'string' }
    ]
}

export const SpaceTypes = {
    Space: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'settings', type: 'string' }
    ]
}
