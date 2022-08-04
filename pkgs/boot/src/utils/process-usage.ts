import pidtree from 'pidtree'

export const printProcessUsage = async () => {
  return
  // const ppid = { pid: process.pid }
  // const list = await pidtree(ppid.pid, { root: true, advanced: true })

  // let parents = {} as any // Hash Map of parents
  // let tree = {} as any // Adiacency Hash Map
  // while (list.length > 0) {
  //   let element = list.pop()
  //   if (element) {
  //     if (tree[element.ppid]) {
  //       tree[element.ppid].push({ pid: element.pid })
  //     } else {
  //       tree[element.ppid] = [{ pid: element.pid }]
  //     }

  //     if (ppid.pid === -1) {
  //       parents[element.pid] = element.ppid
  //     }
  //   }
  // }

  // let roots = [ppid] as any[]
  // if (ppid.pid === -1) {
  //   roots = Object.keys(tree).filter(function (pid) {
  //     return parents[pid] === undefined
  //   })
  // }

  // roots.forEach(function (root) {
  //   print(tree, root)
  // })
}

function print(tree: any, start: any) {
  function printBranch(node: { name: ''; pid: number }, branch: any) {
    let isGraphHead = branch.length === 0
    let children = tree[node.pid] || []

    let branchHead = ''
    if (!isGraphHead) {
      branchHead = children.length > 0 ? '┬ ' : '─ '
    }

    console.log(branch + branchHead + node.pid)

    let baseBranch = branch
    if (!isGraphHead) {
      let isChildOfLastBranch = branch.slice(-2) === '└─'
      baseBranch = branch.slice(0, -2) + (isChildOfLastBranch ? '  ' : '| ')
    }

    let nextBranch = baseBranch + '├─'
    let lastBranch = baseBranch + '└─'
    children.forEach(function (child: any, index: any) {
      printBranch(
        child,
        children.length - 1 === index ? lastBranch : nextBranch
      )
    })
  }

  printBranch(start, '')
}
