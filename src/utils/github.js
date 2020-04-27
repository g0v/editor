class Github {
  constructor(connection, owner, repo) {
    this.connection = connection;
    this.owner = owner;
    this.repo = repo;
    return this;
  }

  getReference(ref) {
    return this.connection.get(`/repos/${this.owner}/${this.repo}/git/refs/heads/${ref}`);
  }

  getCommit(refs) {
    this.commit = this.connection.get(refs.object.url);
    return this.commit;
  }

  getTree(commit) {
    return this.connection.get(commit.tree.url);
  }

  createBlob(content) {
    return this.connection.post(`/repos/${this.owner}/${this.repo}/git/blobs`, {
      data: JSON.stringify({ content: content, encoding: 'utf-8' }),
    });
  }

  createTree(base_tree) {
    return this.connection.post(`/repos/${this.owner}/${this.repo}/git/trees`, {
      data: JSON.stringify({
        base_tree: base_tree.sha,
        tree: [{ path: this.filename, mode: '100644', type: 'blob', sha: this.blob.sha }],
      }),
    });
  }

  createCommit(tree) {
    return this.connection.post(`/repos/${this.owner}/${this.repo}/git/commits`, {
      data: JSON.stringify({
        message: `update ${this.filename}`,
        tree: tree.sha,
        parents: [this.commit.sha],
      }),
    });
  }

  createReference(commit) {
    this.branch = `update-${this.filename}-${Date.now()}`;
    const data = {
      sha: commit.sha,
      ref: `refs/heads/${this.branch}`,
    };
    return this.connection.post(`/repos/${this.owner}/${this.repo}/git/refs`, {
      data: JSON.stringify(data),
    });
  }

  createPullRequest(ref) {
    const data = {
      title: `update ${this.filename}`,
      body: 'this is a pull request from g0v editor',
      head: `${this.owner}:${this.branch}`,
      base: 'master',
    };
    return this.connection.post(`/repos/${this.author}/${this.repo}/pulls`, {
      data: JSON.stringify(data),
    });
  }

  createFork() {
    return new Promise((resolve, reject) => {
      return this.connection.post(`/repos/${this.author}/${this.repo}/forks`)
        .done(resolve).fail(reject);
    });
  }
}

export default Github;
