const refs = '6,8/15,1/1,14/0,3/15,13/9,15/2,5/14,10/4,9/7,2/8,7/3,4/1,6'
  .split('/')
  .map(a => a.split(',').map(a => Number(a)))
const expect = 5

class Node {
  constructor(id, parent = null, children = []) {
    this.id = id
    this.parent = parent
    this.children = children
  }
  depthParent() {
    let root = this
    let depth = 0
    while (root.parent !== null) {
      depth++
      root = root.parent
    }
    return depth
  }
  getParentsNode() {
    let root = this
    let nodes = []
    while (root.parent !== null) {
      root = root.parent
      nodes.push(root)
    }
    return nodes
  }
  getNextParent(nodes, baseNode=this) {
    let root = this
    let nodes = []
    while (root.id !== baseNode.id && root.parent !== null) {
      root = root.parent
      if (root.children.length > 0) {
        let node = root.children
          .map(a => nodes.find(b => a.id !== b.id))
          .find(a => a !== undefined)
        if (node !== undefined) return node
      }
    }
    return null
  }
  depthChildren() {
    let min = Number.MAX_SAFE_INTEGER
    let node = this
    let nodes = []
    while (node!==null) {
      if (nodes.find(n => n.node.id === node.id) === undefined) {
        nodes.push({
          node,
          min: node.minDepth
        })
      }
      if (nodes.children.length === 0) {
        node = this.getNextParent(nodes,this)
        continue
      } else {
        for (let n of node.children) {
          if (nodes.find(nx => nx.node.id === n.id) === undefined) {
            node = n
            break
          }
        }
      }
    }
    return nodes.reduce(Math.min, 10000)
  }
  _depthChildren(node = this, depth = 0) {
    if (this.children.length === 0) return depth
    return Math.max(
      ...this.children.map(child => this.depthChildren(child, depth + 1))
    )
  }
  get minDepth() {
    return Math.max(this.depthChildren(), this.depthParent())
  }
}

class Tree {
  constructor(nodes) {
    this.root = nodes[0]
    this.nodes = nodes
    this.updateRoot()
  }

  updateRoot() {
    while (this.root.parent !== null) this.root = this.root.parent
  }

  _calculMinDepth(node = this.root, min = Number.MAX_SAFE_INTEGER) {
    if (node.children.length === 0) return Math.min(node.minDepth, min)
    return Math.min(
      ...node.children.map(a => this.calculMinDepth(a, min))
    )
  }
  calculMinDepth() {
    let min = Number.MAX_SAFE_INTEGER
    let node = this.root
    let nodes = []
    while (nodes.length !== this.nodes.length) {
      if (nodes.find(n => n.node.id === node.id) === undefined) {
        this.nodes.push({
          node,
          min: node.minDepth
        })
      }
      if (nodes.children.length === 0) {
        node = node.parent
        continue
      } else {
        for (let n of node.children) {
          if (nodes.find(nx => nx.node.id === n.id) === undefined) {
            node = n
            break
          }
        }
      }
    }
    return nodes.reduce(Math.min, 10000)
  }

  static buildFromRefs(refs) {
    //refs = refs.sort((a, b) => a[0] - b[0])
    let nodes = []
    let nodesRefs = []
    for (let ref of refs) {
      let node = nodes.find(a => a.id === ref[0])
      if (node === undefined) {
        node = new Node(ref[0])
        nodes.push(node)
        nodesRefs.push(node)
      }
      let childNode = nodes.find(a => a.id === ref[1])
      if (childNode === undefined) {
        childNode = new Node(ref[1])
        nodes.push(childNode)
      }
      childNode.parent = node
      node.children.push(childNode)
    }
    if (nodes.length === 0) return null
    return new Tree(nodes)
  }
}
let tree = Tree.buildFromRefs(refs)
console.log(tree.calculMinDepth())